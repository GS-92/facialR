package main

import (
	"database/sql"
	datB "faceR_API/faceDB"
	user "faceR_API/faceR_user"
	bcrypt1 "faceR_API/password"
	"fmt"
	"strconv"
	"time"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/middleware/cors"
)

func JsonError(ctx iris.Context, statusCode int, err error) {
	ctx.StatusCode(statusCode)
	ctx.WriteString("Error: " + err.Error())
}

func NotFound(ctx iris.Context, statusCode int) {
	ctx.StatusCode(statusCode)
	ctx.WriteString("User does not exist")
}

func main() {

	//database connection
	db := datB.ConnectPostGres()
	defer db.Close()

	//new server app
	app := iris.New()

	crs := cors.New().AllowOrigin("*").Handler()

	app.Use(crs)

	app.AllowMethods(iris.MethodOptions)

	//
	app.Get("/", func(ctx iris.Context) {
		ctx.JSON("Hello")
	})

	app.Post("/signin", func(ctx iris.Context) {
		var signInRequest struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := ctx.ReadJSON(&signInRequest); err != nil {
			//return a 400 bad request if there's an err decoding the JSON
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(iris.Map{"Error": "Error decoding JSON"})
			return
		}

		//find user by email
		foundUser, err := datB.FindUserByEmail(db, signInRequest.Email)
		if err != nil {
			fmt.Println("Error: ", err)
			return
		}

		//if user is not found or password is incorrect
		if foundUser == nil {
			ctx.StatusCode(iris.StatusUnauthorized)
			ctx.JSON(iris.Map{"error": "username does not exist"})
			return
		}

		//get the password from login
		hash, _ := datB.FindUserPassword(db, signInRequest.Email)

		match := bcrypt1.CheckPasswordHash(hash, signInRequest.Password)

		//check to see if the password match
		if !match {
			ctx.StatusCode(iris.StatusUnauthorized)
			ctx.JSON(iris.Map{"error": "username/password is incorrect"})
			return
		}

		//authentication successful
		ctx.StatusCode(iris.StatusOK)
		ctx.JSON(foundUser)
	})

	app.Post("/signup", func(ctx iris.Context) {
		var newUser struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		//get Current time with date and time only
		currentTime := time.Now().Format("2006-01-02")
		parsedTime, err := time.Parse("2006-01-02", currentTime)
		if err != nil {
			// Handle the error if the time format is incorrect
			JsonError(ctx, iris.StatusInternalServerError, err)
			return
		}

		if err = ctx.ReadJSON(&newUser); err != nil {
			//return a 400 bad request if there's an err decoding the JSON
			JsonError(ctx, iris.StatusBadRequest, err)
			return
		}

		user := user.User{
			Name:    newUser.Name,
			Email:   newUser.Email,
			Entries: 0,
			Joined:  parsedTime,
		}

		//hash password
		hashedPassword, err := bcrypt1.HashPassword(newUser.Password)
		if err != nil {
			fmt.Println("Error hashing: ", err)
		}

		foundUser, err := datB.FindUserByEmail(db, user.Email)
		if err != nil {
			fmt.Println("Message:", err)
		}

		//If user exist it will respond with 401
		if foundUser != nil && foundUser.Email == user.Email {
			ctx.StatusCode(iris.StatusUnauthorized)
			ctx.WriteString("401")
			return
		}

		txFunc1 := func(tx *sql.Tx) error {
			if err := datB.InsertIntoUsers(tx, user.Name, user.Email, user.Entries, user.Joined); err != nil {
				return err
			}

			// get ID from users table
			var userID int
			query := `SELECT id FROM users WHERE email = $1`
			err := tx.QueryRow(query, user.Email).Scan(&userID)
			if err != nil {
				return err
			}

			if err := datB.InsertIntoLogin(tx, userID, hashedPassword, user.Email); err != nil {
				return err
			}

			return nil
		}

		err = datB.PerformTransaction(db, txFunc1)
		if err != nil {
			fmt.Println("Transaction failed:", err)
		}

		currentUser, err := datB.FindUserByEmail(db, user.Email)
		if err != nil {
			fmt.Println(err)
		}

		ctx.StatusCode(iris.StatusCreated)
		ctx.JSON(currentUser)

	})

	//define route using user ID
	app.Get("/profile/{id}", func(ctx iris.Context) {
		//get the ID from the parameter request
		id := ctx.Params().Get("id")

		// convert id into an int
		intID, err := strconv.Atoi(id)
		if err != nil {
			fmt.Println("Could not convert param string into an integer...: ", err)
		}

		//look for user using ID
		foundUser, err := datB.FindUserByID(db, intID)
		if err != nil {
			JsonError(ctx, iris.StatusNotAcceptable, err)
			return
		}

		if foundUser != nil {
			ctx.JSON(foundUser)
		} else {
			NotFound(ctx, iris.StatusNotFound)
		}

	})

	app.Put("/image", func(ctx iris.Context) {
		var id struct {
			Id int `json:"id"`
		}

		//look for user using ID
		if err := ctx.ReadJSON(&id); err != nil {
			JsonError(ctx, iris.StatusBadRequest, err)
			return
		}

		found, err := datB.FindUserByID(db, id.Id)
		if err != nil {
			JsonError(ctx, iris.StatusInternalServerError, err)
			fmt.Println(id.Id)
			return
		}

		if found == nil {
			NotFound(ctx, iris.StatusNotFound)
			fmt.Println("Not found.")
			return
		}

		found.Entries++

		//upate
		datB.UpdateID(db, found.Entries, found.ID)

		ctx.JSON(found.Entries)
	})

	//port
	app.Listen(":3030")

}
