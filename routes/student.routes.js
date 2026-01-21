const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const {
    fullName,
    gender,
    dob,
    age,
    email,
    school,
    parentName,
    parentEmail,
    parentPhone,
    relation,
    communication,
    customFields
  } = req.body;

  const studentSql = `
    INSERT INTO students
    (full_name, gender, dob, age, email, school,
     parent_name, parent_email, parent_phone,
     relation_to_student, communication_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const studentValues = [
    fullName,
    gender,
    dob,
    age,
    email,
    school,
    parentName,
    parentEmail,
    parentPhone,
    relation,
    communication
  ];

  db.query(studentSql, studentValues, (err, result) => {
    if (err) return res.status(500).json(err);

    const studentId = result.insertId;

    // Insert custom fields (if any)
    if (customFields && Object.keys(customFields).length > 0) {
      const customSql = `
        INSERT INTO student_custom_fields
        (student_id, field_name, field_value)
        VALUES ?
      `;

      const customValues = Object.entries(customFields).map(
        ([key, value]) => [studentId, key, value]
      );

      db.query(customSql, [customValues], err => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ message: "Student created" });
      });
    } else {
      res.status(201).json({ message: "Student created" });
    }
  });
});

module.exports = router;
