package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

// User โครงสร้างข้อมูลผู้ใช้
type User struct {
	ID         int    `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Gender     string `json:"gender"`
	BirthDate  string `json:"birth_date"`
	Phone      string `json:"phone"`
	Address    string `json:"address"`
	City       string `json:"city"`
	Country    string `json:"country"`
	PostalCode string `json:"postal_code"`
}

// ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
func getAllUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("GET /api/users - Getting all users")

		if r.Method != "GET" {
			http.Error(w, "Method not allowed", 405)
			return
		}

		rows, err := db.Query("SELECT id, username, email, first_name, last_name, gender, birth_date, phone, address, city, country, postal_code FROM users")
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer rows.Close()

		var users []User
		for rows.Next() {
			var u User
			rows.Scan(&u.ID, &u.Username, &u.Email, &u.FirstName, &u.LastName, &u.Gender, &u.BirthDate, &u.Phone, &u.Address, &u.City, &u.Country, &u.PostalCode)
			users = append(users, u)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม ID
func getUserByID(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("GET /api/users/:id - Getting user by ID")

		if r.Method != "GET" {
			http.Error(w, "Method not allowed", 405)
			return
		}

		var id int
		fmt.Sscanf(r.URL.Path[11:], "%d", &id)

		var u User
		err := db.QueryRow("SELECT id, username, email, first_name, last_name, gender, birth_date, phone, address, city, country, postal_code FROM users WHERE id = ?", id).Scan(&u.ID, &u.Username, &u.Email, &u.FirstName, &u.LastName, &u.Gender, &u.BirthDate, &u.Phone, &u.Address, &u.City, &u.Country, &u.PostalCode)

		if err == sql.ErrNoRows {
			http.Error(w, "User not found", 404)
			return
		}
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(u)
	}
}

// ฟังก์ชัน CORS
func cors(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// เพิ่ม CORS headers ก่อนเสมอ
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// ถ้าเป็น OPTIONS ให้ return ทันที
		if r.Method == "OPTIONS" {
			w.WriteHeader(200)
			return
		}

		// เรียก handler
		h(w, r)
	}
}

func main() {
	db, err := sql.Open("mysql", "myuser:mypassword@tcp(localhost:3306)/mydatabase")
	if err != nil {
		fmt.Println(err)
	}
	defer db.Close()

	db.Ping()
	fmt.Println("Connected to database")

	// route
	http.HandleFunc("/api/users", cors(getAllUsers(db)))
	http.HandleFunc("/api/users/", cors(getUserByID(db)))

	// รัน server
	fmt.Println(http.ListenAndServe(":8080", nil))
}
