const Order = require("../models/order.model");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const statusText = require("../utils/statusText");

const addItemToOrder = asyncWrapper(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const userId = req.currentUser.ownerId;

    if (!productId || !quantity) {
        return next(appError.create("Product ID and quantity are required", 400, statusText.FAIL));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(appError.create("Product not found", 404, statusText.FAIL));
    }

    const unitPrice = product.price;
    const totalPrice = unitPrice * Number(quantity);

    let order = await Order.findOne({ ownerId: userId, status: "pending" });

    if (!order) {
        order = new Order({
            ownerId: userId,
            items: [{ productId, quantity, unitPrice, totalPrice }],
            totalAmount: totalPrice,
            status: "pending",
            createdAt: new Date()
        });
    } else {
        const existingItem = order.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.quantity * unitPrice;
        } else {
            order.items.push({ productId, quantity, unitPrice, totalPrice });
        }

        order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    await order.save();

    const vieworder = await Order.findOne({
            ownerId: req.currentUser.ownerId,
            status: "pending"
        })
        .sort({ createdAt: -1 })
        .populate("items.productId", "-__v"); 

    const formattedItems = vieworder.items.map(item => {
        const { productId, ...rest } = item.toObject();
        return {
            ...rest,
            productInfo: productId
        };
    });

    const formattedOrder = {
        ...order.toObject(),
        items: formattedItems
    };

    res.status(200).json({ status: statusText.SUCCESS, data: { order: formattedOrder } });
});

const removeItemFromOrder = asyncWrapper(async (req, res, next) => {
    // const { productId } = req.params.productId;
    const { productId } = req.params;
    const userId = req.currentUser.ownerId;

    const order = await Order.findOne({ ownerId: userId, status: "pending" });

    if (!order) {
        return next(appError.create("No pending order found", 404, statusText.FAIL));
    }

    const itemIndex = order.items.findIndex(
        item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
        return next(appError.create("Item not found in order", 404, statusText.FAIL));
    }

    order.items.splice(itemIndex, 1);

    order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

    if (order.items.length === 0) {
        await Order.findByIdAndDelete(order._id);
        return res.status(200).json({ status: statusText.SUCCESS, msg: "Order deleted (empty)" });
    }

    await order.save();

    const vieworder = await Order.findOne({
            ownerId: req.currentUser.ownerId,
            status: "pending"
        })
        .sort({ createdAt: -1 })
        .populate("items.productId", "-__v"); 

    const formattedItems = vieworder.items.map(item => {
        const { productId, ...rest } = item.toObject();
        return {
            ...rest,
            productInfo: productId
        };
    });

    const formattedOrder = {
        ...order.toObject(),
        items: formattedItems
    };

    res.status(200).json({ status: statusText.SUCCESS, data: { order: formattedOrder } });
});

const decreaseItemQuantity = asyncWrapper(async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.currentUser.ownerId;

    const order = await Order.findOne({ ownerId: userId, status: "pending" });

    if (!order) {
        return next(appError.create("No pending order found", 404, statusText.FAIL));
    }

    const itemIndex = order.items.findIndex(
        item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
        return next(appError.create("Item not found in order", 404, statusText.FAIL));
    }

    const item = order.items[itemIndex];

    if (item.quantity <= 1) {
        order.items.splice(itemIndex, 1);
    } else {
        item.quantity -= 1;
        item.totalPrice = item.unitPrice * item.quantity;
    }

    order.totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

    if (order.items.length === 0) {
        await Order.findByIdAndDelete(order._id);
        return res.status(200).json({ status: statusText.SUCCESS, msg: "Order deleted (empty)" });
    }

    await order.save();

    const vieworder = await Order.findOne({
            ownerId: req.currentUser.ownerId,
            status: "pending"
        })
        .sort({ createdAt: -1 })
        .populate("items.productId", "-__v"); 

    const formattedItems = vieworder.items.map(item => {
        const { productId, ...rest } = item.toObject();
        return {
            ...rest,
            productInfo: productId
        };
    });

    const formattedOrder = {
        ...order.toObject(),
        items: formattedItems
    };

    res.status(200).json({ status: statusText.SUCCESS, data: { order: formattedOrder } });
});


const confirmOrder = asyncWrapper(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(appError.create("Order not found", 404, statusText.FAIL));
    }

    if (order.status !== "pending") {
        return next(appError.create("Only pending orders can be confirmed", 400, statusText.FAIL));
    }

    const { address } = req.body;
    if (!address || address.trim() === "") {
        return next(appError.create("Address is required to confirm the order", 400, statusText.FAIL));
    }

    for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return next(appError.create(`Product not found: ${item.productId}`, 404, statusText.FAIL));
        }

        if (product.quantity < item.quantity) {
            return next(appError.create(`Not enough quantity for product: ${product.title}`, 400, statusText.FAIL));
        }

        product.quantity -= item.quantity;
        product.sold += item.quantity;

        await product.save();
    }

    order.status = "confirmed";
    order.address = address;
    await order.save();

    // const vieworder = await Order.findOne({
    //         ownerId: req.currentUser.ownerId,
    //         status: "pending"
    //     })
    //     .sort({ createdAt: -1 })
    //     .populate("items.productId", "-__v"); 

    const vieworder = await Order.findById(req.params.id).populate("items.productId", "-__v");

    console.log(vieworder)
    const formattedItems = vieworder.items.map(item => {
        const { productId, ...rest } = item.toObject();
        return {
            ...rest,
            productInfo: productId
        };
    });

    const formattedOrder = {
        ...order.toObject(),
        items: formattedItems
    };

    res.status(200).json({status: statusText.SUCCESS, data: { order: formattedOrder }});
});

const getLastPendingOrder = asyncWrapper(async (req, res, next) => {
    const order = await Order.findOne({
        ownerId: req.currentUser.ownerId,
        status: "pending"
    })
    .sort({ createdAt: -1 })
    .populate("items.productId", "-__v"); 

    if (!order) {
        return next(appError.create("No pending order found", 404, statusText.FAIL));
    }

    const formattedItems = order.items.map(item => {
        const { productId, ...rest } = item.toObject();
        return {
            ...rest,
            productInfo: productId
        };
    });

    const formattedOrder = {
        ...order.toObject(),
        items: formattedItems
    };

    res.status(200).json({status: statusText.SUCCESS, data: { order: formattedOrder }});
});


module.exports = {
    // createOrder,
    // getAllOrders,
    // getOrderById,
    // updateOrderStatus,
    // deleteOrder,
    addItemToOrder,
    removeItemFromOrder,
    confirmOrder,
    getLastPendingOrder,
    decreaseItemQuantity,
};