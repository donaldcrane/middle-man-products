
const router = require("express").Router();
const History = require("../models/history");


/* Get History */
router.get("/history", async (req, res) => {
    try {
        let history = await History.find()
        
        if (!history) {
            return res.status(400).json({
                status: false,
                message: "History not found",
            })
        }
        res.status(200).json({
            status: true,
            data: history
        })
    
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
          });
    }
    })

    module.exports = router;