const cuid = require('cuid');
const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

const productsFile = path.join(__dirname, 'data/full-products.json');

/**
 * Define the Product Schema (MongoDB)
 */
const Product = db.model('Product', {
    _id: { type: String, default: cuid },
    description: { type: String },
    alt_description: { type: String },
    likes: { type: Number, required: true },
    urls: {
        regular: { type: String, required: true },
        small: { type: String, required: true },
        thumb: { type: String, required: true },
    },
    links: {
        self: { type: String, required: true },
        html: { type: String, required: true },
    },
    user: {
        id: { type: String, required: true },
        first_name: { type: String, required: true },
        last_name: { type: String },
        portfolio_url: { type: String },
        username: { type: String, required: true },
    },
    tags: [{
        title: { type: String, required: true },
    }]
});

/**
 * List products (Fetch from MongoDB first, fallback to JSON)
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
async function list(options = {}) {
    const { offset = 0, limit = 25, tag } = options;

    try {
        const query = tag ? { tags: { $elemMatch: { title: tag } } } : {};
        const products = await Product.find(query)
            .sort({ _id: 1 })
            .skip(offset)
            .limit(limit);

        return products;
    } catch (error) {
        console.error("MongoDB connection error. Falling back to JSON file:", error);

        const data = await fs.readFile(productsFile);
        return JSON.parse(data)
            .filter(product => !tag || product.tags.find(({ title }) => title === tag))
            .slice(offset, offset + limit);
    }
}

/**
 * Get a single product (MongoDB first, fallback to JSON)
 * @param {String} id
 * @returns {Promise<Object>}
 */
async function get(id) {
    try {
        const product = await Product.findById(id);
        if (product) return product;
    } catch (error) {
        console.error("MongoDB error. Falling back to JSON file:", error);
    }

    const products = JSON.parse(await fs.readFile(productsFile));
    return products.find(product => product.id === id) || null;
}

/**
 * Create a new product and save it in MongoDB
 * @param {Object} fields
 * @returns {Promise<Object>}
 */
async function create(fields) {
    const product = new Product(fields);
    return await product.save();
}

/**
 * Edit an existing product
 * @param {String} _id
 * @param {Object} changes
 * @returns {Promise<Object>}
 */
async function edit(_id, changes) {
    const product = await Product.findByIdAndUpdate(_id, changes, { new: true });
    return product;
}

/**
 * Delete a product from MongoDB
 * @param {String} _id
 * @returns {Promise<Object>}
 */
async function destroy(_id) {
    return await Product.deleteOne({ _id });
}

/**
 * Export all functions
 */
module.exports = {
    list,
    get,
    create,
    edit,
    destroy
};
