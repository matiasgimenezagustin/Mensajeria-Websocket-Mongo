const {Product  } =  require('./models/productModel')
const {Counter} = require('./models/counterModel')



class ProductManager {

    static productProperties = ["title", "description", "price", "code", "stock"]
    static errors = {
        incompleteProduct: `The product must have ${ProductManager.productProperties.join(", ")}` ,
        repeatCodeField: "You cannot repeat the code field",
        invalidId: "The product´s id provided incorrect",
        notFound: "Product not found"
    }
    constructor(){

        this.products = []
        this.counter = 0
    }

    hasAllProperties = (productToCheck) =>{
        const results = []
        for(const property of ProductManager.productProperties){
            results.push(Object.keys(productToCheck).includes(property))
        }
        return results.every(result => result)
    }
    async addProductToMongo(productToAdd) {
        if (this.hasAllProperties(productToAdd)) {
            const counterDoc = await Counter.findOneAndUpdate(
                { _id: 'product_counter' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            if (!(await Product.exists({ code: productToAdd.code }))) {
                const newProduct = new Product({
                    ...productToAdd,
                    id: counterDoc.seq,
                });
                await newProduct.save();
                return { ok: true, content: newProduct };
            } else {
                return { ok: false, error: ProductManager.errors.repeatCodeField };
            }
        } else {
            return { ok: false, error: ProductManager.errors.incompleteProduct };
        }
    }

    async getProductsFromMongo(limit) {
        try {
            let query = Product.find();
            if (limit) {
                query = query.limit(limit);
            }
            const products = await query.exec();
            return { ok: true, content: products };
        } catch (error) {
            return { ok: false, error: 'Error getting products' };
        }
    }
    async getProductByIdFromMongo(id) {
        try {
            const product = await Product.findOne({ id: Number(id) });
            if (product) {
                return { ok: true, content: product };
            } else {
                return { ok: false, error: ProductManager.errors.notFound };
            }
        } catch (error) {
            console.error('Error getting product by ID:', error);
            return { ok: false, error: 'Error getting product by ID' };
        }
    }


    async deleteProductByIdFromMongo(id) {
        try {
            await Product.findOneAndDelete({ id: Number(id) });
            const productFound = await this.getProductByIdFromMongo(id)
            return productFound.ok ? {ok: false, error: 'Error deleting product by ID' } : {ok: true, content: 'The product was deleted'}
        } catch (error) {
            console.error('Error deleting product by ID:', error);
            return { ok: false, error: 'Error deleting product by ID' };
        }
    }

    async updateProductByIdInMongo(id, productToUpdate) {
        try {
            const product = await Product.findOneAndUpdate(
                { id: Number(id) },
                { $set: productToUpdate },
                { new: true }
            );
            return {ok: true, updatedProduct: product}
        } catch (error) {
            console.error('Error updating product by ID:', error);
            return { ok: false, error: 'Error updating product by ID' };
        }
    }

}


const manager = new ProductManager()
module.exports = { manager };
