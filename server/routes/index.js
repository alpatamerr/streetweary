const express = require('express');
const passport = require('passport');
const Router = require('express-promise-router');
const {
  auth,
  products,
  users,
  carts,
  orders,
  payment,
} = require('../controllers');
const {
  validateGetProducts,
  validateSignUp,
  validateLogin,
  validatePostProduct,
  validatePutProduct,
  validateDeleteProduct,
  validatePutUser,
  validateDeleteUser,
  validateCart,
  validateDeleteCartProduct,
  validateOrder,
} = require('./validation');

const router = new Router();

router
  // Authentication Routes
  .post('/auth/signup', validateSignUp, auth.signupUser)
  .post('/auth/login', validateLogin, auth.loginUser)
  .post('/auth/logout', auth.logoutUser)
  .get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  )
  .get(
    '/auth/google/redirect',
    passport.authenticate('google', { session: false }),
    auth.loginGoogle
  )

  // Product Routes
  .get('/products', products.getAllProducts)
  .get('/products/:id', validateGetProducts, products.getProductById)
  .post(
    '/products',
    validatePostProduct,
    passport.authenticate('jwt-admin', { session: false }),
    products.postProduct
  )
  .put(
    '/products/:id',
    validatePutProduct,
    passport.authenticate('jwt-admin', { session: false }),
    products.putProduct
  )
  .delete(
    '/products/:id',
    validateDeleteProduct,
    passport.authenticate('jwt-admin', { session: false }),
    products.deleteProduct
  )

  // User Routes
  .get('/users', passport.authenticate('jwt-admin', { session: false }), users.getAllUsers)
  .get(
    '/users/self',
    passport.authenticate('jwt-customer', { session: false }),
    users.getUserSelf
  )
  .put(
    '/users/self',
    validatePutUser,
    passport.authenticate('jwt-customer', { session: false }),
    users.putUserSelf
  )
  .delete(
    '/users/:id',
    validateDeleteUser,
    passport.authenticate('jwt-admin', { session: false }),
    users.deleteUser
  )

  // Cart Routes
  .get('/carts', passport.authenticate('jwt-admin', { session: false }), carts.getAllCarts)
  .post(
    '/carts/self',
    passport.authenticate('jwt-customer', { session: false }),
    carts.syncCartSelf
  )
  .post(
    '/carts/self/product',
    validateCart,
    passport.authenticate('jwt-customer', { session: false }),
    carts.postProductInCartSelf
  )
  .put(
    '/carts/self/product',
    validateCart,
    passport.authenticate('jwt-customer', { session: false }),
    carts.putCartSelf
  )
  .delete(
    '/carts/self/product',
    validateDeleteCartProduct,
    passport.authenticate('jwt-customer', { session: false }),
    carts.deleteCartProductSelf
  )
  .post(
    '/carts/self/checkout',
    passport.authenticate('jwt-customer', { session: false }),
    carts.checkoutCart
  )

  // Order Routes
  .get('/orders', passport.authenticate('jwt-admin', { session: false }), orders.getAllOrders)
  .get(
    '/orders/review/:orderId',
    validateOrder,
    passport.authenticate('jwt-admin', { session: false }),
    orders.getOrderById
  )
  .get(
    '/orders/self',
    passport.authenticate('jwt-customer', { session: false }),
    orders.getOrdersSelf
  )

  // Payment Route
  .post(
    '/payment/create-payment-intent',
    passport.authenticate('jwt-customer', { session: false }),
    payment.createPaymentIntent
  );

module.exports = router;
