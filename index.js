import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import Categories from './routes/categories.js';
import CategoriesAPI from './api/categories-api.js';
import Products from './routes/products.js';
import ProductsAPI from './api/products-api.js';
import UserAPI from './api/user-api.js';

const app = express();
import session from 'express-session';
import flash from 'express-flash';
import CategoryService from './services/category-service.js';
import ProductService from './services/product-service.js';
import UserService from './services/user-service.js';
import pgPromise from 'pg-promise';

const DATABASE_URL = 'postgresql://codex:codex123@localhost:5432/users';

const config = {
  connectionString: DATABASE_URL,
};

// if (process.env.NODE_ENV == 'production') {
//   config.ssl = {
//     rejectUnauthorized: false,
//   };
// }

const db = pgPromise()(config);

const categoryService = CategoryService(db);
const productService = ProductService(db);
const userService = UserService(db);

const categoryRoutes = Categories(categoryService);
const productRoutes = Products(productService, categoryService);

const categoryAPI = CategoriesAPI(categoryService);
const productsAPI = ProductsAPI(productService);
const userAPI = UserAPI(userService);

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

app.get('/categories', categoryRoutes.show);
app.get('/categories/add', categoryRoutes.showAdd);
app.get('/categories/edit/:id', categoryRoutes.get);
app.post('/categories/update/:id', categoryRoutes.update);
app.post('/categories/add', categoryRoutes.add);
app.get('/categories/delete/:id', categoryRoutes.delete);

app.get('/', productRoutes.show);
app.get('/products', productRoutes.show);
app.get('/products/edit/:id', productRoutes.get);
app.post('/products/update/:id', productRoutes.update);
app.get('/products/add', productRoutes.showAdd);
app.post('/products/add', productRoutes.add);
app.get('/products/delete/:id', productRoutes.delete);

app.get('/api/products', productsAPI.all);
app.post('/api/products', productsAPI.add);

app.get('/api/categories', categoryAPI.all);

app.get('/api/users', userAPI.user);
app.post('/api/signUp', userAPI.signUp);
app.post('/api/login', userAPI.login);

app.use(errorHandler);

const portNumber = process.env.PORT || 3000;

app.listen(portNumber, () => {
  console.log('Create, Read, Update, and Delete (CRUD) example server listening on:', portNumber);
});
