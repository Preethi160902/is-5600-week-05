const express = require('express');
const router = express.Router();
const path = require('path');
const Products = require('./products');
const Orders = require('./orders');

// Root route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Product routes
router.get('/products', async (req, res) => {
    try {
        const { offset = 0, limit = 25, tag } = req.query;
        const products = await Products.list({
            offset: Number(offset),
            limit: Number(limit),
            tag
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add order routes
router.get('/orders', async (req, res) => {
    console.log('Getting orders');
    try {
        const { offset = 0, limit = 25, productId, status } = req.query;
        const orders = await Orders.list({ 
            offset: Number(offset), 
            limit: Number(limit),
            productId, 
            status 
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/orders', async (req, res) => {
    console.log('Creating order');
    try {
        const order = await Orders.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/orders/:id', async (req, res) => {
    try {
        const order = await Orders.edit(req.params.id, req.body);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        const result = await Orders.destroy(req.params.id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;