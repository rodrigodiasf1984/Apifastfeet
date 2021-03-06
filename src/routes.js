import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import ShowDeliveriesController from './app/controllers/ShowDeliveriesController';
import DeliveryStatusController from './app/controllers/DeliveryStatusController';
import PickUpDeliveryController from './app/controllers/PickUpDeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import authMidlleware from './app/middlewares/AuthMiddleware';
import adminMidlleware from './app/middlewares/AdminUser';

import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';
import validateSessionStore from './app/validators/SessionStore';
import validateShowDeliveriesIndex from './app/validators/ShowDeliveriesIndex';
import validateRecipientStore from './app/validators/RecipientStore';
import validateRecipientUpdate from './app/validators/RecipientUpdate';
import validateRecipientDelete from './app/validators/RecipientDelete';
import validatePickUpDelivery from './app/validators/PickUpDeliveryUpdate';
import validateDeliveryStatusUpdate from './app/validators/DeliveryStatusUpdate';
import validateDeliveryProblemDelete from './app/validators/DeliveryProblemDelete';
import validateDeliveryProblemStore from './app/validators/DeliveryProblemStore';
import validateDeliveryProblemShow from './app/validators/DeliveryProblemShow';
import validateDeliverymanStore from './app/validators/DeliverymanStore';
import validateDeliverymanUpdate from './app/validators/DeliverymanUpdate';
import validateDeliverymanDelete from './app/validators/DeliverymanDelete';
import validateDeliverymanShow from './app/validators/DeliverymanShow';
import validateDeliveryStore from './app/validators/DeliveryStore';
import validateDeliveryUpdate from './app/validators/DeliveryUpdate';
import validateDeliveryDelete from './app/validators/DeliveryDelete';

const routes = new Router();
const upload = multer(multerConfig);
// Segurança no nodeJs
const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const bruteForce = new Brute(bruteStore);
// Rota para listar problema de uma entrega especifíca
routes.get(
  '/delivery/:id/problems',
  validateDeliveryProblemShow,
  DeliveryProblemController.show
);
// Rota para mostrar um Deliveryman
routes.get(
  '/deliverymans/:id',
  validateDeliverymanShow,
  DeliverymanController.show
);
// Rota para listar entregas do Deliveryman
routes.get(
  '/deliveryman/:id/deliveries',
  validateShowDeliveriesIndex,
  ShowDeliveriesController.index
);
// Rota para finalizar a entrega
routes.put(
  '/deliveryman/:deliveryman_id/deliveries_status/:delivery_id',
  upload.single('file'),
  validateDeliveryStatusUpdate,
  DeliveryStatusController.update
);
// Rota para retirar entregas => max 5 por dia
routes.put(
  '/deliveryman/:deliveryman_id/deliveries/:delivery_id',
  validatePickUpDelivery,
  PickUpDeliveryController.update
);
// Rota para criar um problema referente a entrega
routes.post(
  '/delivery/:delivery_id/problems',
  validateDeliveryProblemStore,
  DeliveryProblemController.store
);
// Rota para criação do utilizador, usando o método store dentro do UserController
routes.post('/users', validateUserStore, UserController.store);
// Rota para login
routes.post(
  '/sessions',
  bruteForce.prevent,
  validateSessionStore,
  SessionController.store
);

// Usa o authMiddleware globalmente para as rotas posteriores "se o user não estiver logado o mesmo não consegue acessar as rotas abaixo"
routes.use(authMidlleware);
// Rota para update do user
routes.put('/users', validateUserUpdate, UserController.update);
// Rota para criar novo destinatário
routes.post(
  '/recipients',
  adminMidlleware,
  validateRecipientStore,
  RecipientController.store
);
// Rota para atualizar o destinatário
routes.put(
  '/recipients/:id',
  adminMidlleware,
  validateRecipientUpdate,
  RecipientController.update
);
// Rota para apagar um destinatário
routes.delete(
  '/recipients/:id',
  adminMidlleware,
  validateRecipientDelete,
  RecipientController.delete
);
// rota para listar todos os destinatários
routes.get('/recipients', RecipientController.index);
// Rota para fazer o upload od avatar do entregador
routes.post('/files', upload.single('file'), FileController.store);
// Rota para cadastrar entregadores
routes.post(
  '/deliverymans',
  adminMidlleware,
  validateDeliverymanStore,
  DeliverymanController.store
);
// Rota para update dos entregadores
routes.put(
  '/deliverymans/:id',
  adminMidlleware,
  validateDeliverymanUpdate,
  DeliverymanController.update
);
// Rota para listar todos os entregadores
routes.get('/deliverymans', adminMidlleware, DeliverymanController.index);
// Rota para apagar um entregador
routes.delete(
  '/deliverymans/:id',
  adminMidlleware,
  validateDeliverymanDelete,
  DeliverymanController.delete
);
// Rota para criar uma entrega Admin
routes.post(
  '/deliveries',
  adminMidlleware,
  validateDeliveryStore,
  DeliveryController.store
);
// Rota para apagar uma entrega Admin
routes.delete(
  '/deliveries/:id',
  adminMidlleware,
  validateDeliveryDelete,
  DeliveryController.delete
);
// Rota para update de uma entrega Admin
routes.put(
  '/deliveries/:id',
  adminMidlleware,
  validateDeliveryUpdate,
  DeliveryController.update
);
// Rota para listar todas as encomendas Admin
routes.get('/deliveries', adminMidlleware, DeliveryController.index);
// Rota para listar entregas com problems
routes.get(
  '/delivery/problems',
  adminMidlleware,
  DeliveryProblemController.index
);
// // Rota para cancelar entregas com problems
routes.delete(
  '/problem/:delivery_id/cancel-delivery',
  adminMidlleware,
  validateDeliveryProblemDelete,
  DeliveryProblemController.delete
);

export default routes;
