import express from "express";
import { pool } from "../dbConnection/db_init.js";
import { getJWT } from "../helpers/get-jwt.js";
import authorize from "../middlewares/authorize.js";
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const query = `
  INSERT INTO user_details (user_name, email, password)
  VALUES (?, ?, ?)`;
    const result = await pool.query(query, [userName, email, password]);
    if (result) {
      console.log("Record inserted successfully.");
      res.status(200).send({
        message: "Record Inserted Successfully",
        status: 200,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at at api/user/create  ${error} `);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = `
  select * from user_details where email=? and password=?`;
    const [rows] = await pool.query(query, [email, password]);
    console.log(rows[0]);
    let payload = rows[0];
    if (rows.length) {
      const token = getJWT(payload);
      console.log("Record inserted successfully.");
      res.status(200).send({
        message: "Logged in Successfully",
        status: 200,
        data: { token },
      });
    } else {
      res.status(200).send({
        message: "No Record Matched",
        status: 404,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at at api/user/login ${error} `);
  }
});
router.post("/createCustomer", authorize, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const { user_name, user_id } = req.user;
    const query = `
  INSERT INTO customer_details (first_name,last_name, email, created_by,user_id)
  VALUES (?, ?, ?, ?, ?)`;
    const result = await pool.query(query, [
      firstName,
      lastName,
      email,
      user_name,
      user_id,
    ]);
    if (result) {
      console.log("Record inserted successfully.");
      res.status(200).send({
        message: "Record Inserted Successfully",
        status: 200,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(
      `Error at at api/user/createCustomer ${JSON.stringify(error)}\n${error} `
    );
  }
});
router.post("/listCustomers", authorize, async (req, res) => {
  try {
    const { user_id } = req.user;
    const query = `
  select * from customer_details where user_id=? `;
    const [rows] = await pool.query(query, [user_id]);
    if (rows.length > 0) {
      console.log("Customer listed successfully.");
      res.status(200).send({
        message: "Customer listed successfully.",
        status: 200,
        data: rows,
      });
    } else {
      console.log(
        "There is no customer details present in the database for the current user"
      );
      res.status(200).send({
        message: "Success",
        status: 404,
        data: "Sorry we haven't found any customer details present in the database for the current user",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(
      `Error at at api/user/listCustomers ${JSON.stringify(error)}\n${error} `
    );
  }
});
router.put("/updateCustomer/:id", authorize, async function (req, res) {
  try {
    const { firstName, lastName, email } = req.body;
    const customerId = req.params.id;
    // console.log(customerId);
    const [rows] = await pool.query(
      "select * from customer_details where customer_id=?",
      [customerId]
    );
    if (rows[0]) {
      const result = await pool.query(
        "update customer_details set first_name=?,last_name=?,email=? where customer_id=?",
        [firstName, lastName, email, customerId]
      );
      if (result) {
        console.log("Customer Updated Successfully");
        res.status(200).send({
          message: "Customer Updated Successfully",
          status: 200,
        });
      }
    } else {
      console.log("No Customer Found");
      res.status(200).send({
        message: "No Customer Found",
        status: 404,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at api/user/updateCustomer ${error} `);
  }
});
router.delete("/deleteCustomer", authorize, async function (req, res) {
  try {
    const { customerId, firstName } = req.body;

    const result = await pool.query(
      "delete from customer_details where customer_id=?",
      [customerId, firstName]
    );
    if (result) {
      console.log("User Deleted Successfully");
      res.status(200).send({
        message: "User Deleted Successfully",
        status: 200,
        data: { customerId: customerId, customerName: firstName },
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
    });
    console.log(`Error at api/user/deleteCustomer ${error} `);
  }
});
export default router;
