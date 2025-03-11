<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
  <h1 align="center">Taskflow Microservices</h1>
</p>

## Descripción

Una plataforma que permite a los equipos crear, asignar y gestionar tareas en tiempo real, implementando un arquitectura basada en microservicios

---

## Características Principales

- Creación, asignación y gestión de tareas.
- Autenticación segura con JWT y gestión de roles.
- Notificaciones en tiempo real mediante emails.
- Guardado de logs en la base de datos.
- Implementación de caché con Redis para mejorar el rendimiento.
- Comunicación entre microservicios mediante RabbitMQ y Redis.
- Se provee de un fichero docker-compose para facilitar la ejecución del proyecto. Cada microservicio se ejecuta en su propio contenedor, lo que permite una mayor flexibilidad y mantenimiento.

---

## Tecnologías Utilizadas

- NestJS
- TypeScript
- Prisma
- Redis
- RabbitMQ
- JWT
- Docker

---

## Arquitectura del Proyecto

El sistema está compuesto por varios microservicios independientes, cada uno con una responsabilidad específica.

1. [**API-Getawey**](#1-api-getawey): Servicio de API que proporciona una interfaz para los microservicios.
2. [**Auth**](#2-auth): Servicio de autenticación que utiliza JWT para gestionar los roles , la gestión de usuarios y el acceso a las funciones.
3. [**Tasks**](#3-tasks): Servicio de gestión de tareas que permite crear, asignar y gestionar tareas.
4. [**Logs**](#4-logs): Servicio de gestión de logs que almacena los registros de eventos y los envía a la base de datos.
5. [**Notifications**](#5-notifications): Servicio de notificaciones que envía notificaciones en tiempo real a los usuarios.
6. [**Redis**](#6-redis): Servicio de caché que almacena los datos de la base de datos y los envía a los microservicios.
7. [**RabbitMQ**](#7-rabbitmq): Servicio de comunicación entre los microservicios que utiliza el protocolo de mensajería de RabbitMQ.
8. [**MongoDB**](#8-mongodb): Base de datos que almacena los datos de los usuarios y los logs.
9. [**PostgreSQL**](#9-postgresql): Base de datos que almacena los datos de las tareas.


### 1. API-Getawey

El servicio de API-Getawey proporciona una interfaz para los microservicios. Permite a los usuarios realizar solicitudes a los servicios de manera sencilla y segura. Se encarga de permitir a los usuarios acceder a las funciones de los microservicios dependiendo de su rol y de hacer un primer filtro de seguridad.


### 2. Auth

El servicio de autenticación se encarga de gestionar los roles, la gestión de usuarios y el acceso a las funciones. El microservicio está creado sobre una base de datos MongoDB. El servicio se encarga de:

- Almacenar los datos de los usuarios en la base de datos.
- Validar los datos de los usuarios y generar un token JWT.
- Verificar el token JWT y extraer los datos del usuario.
- Verificar el rol del usuario y determinar si tiene acceso a la función. Se compone de 3 roles: admin, manager y user.
- Verificar si el usuario está activo.
- Verificar si el usuario existe en la base de datos.
- Listar usuarios y buscar usuarios por ID.

### 3. Tasks

El servicio de gestión de tareas se encarga de crear, asignar y gestionar tareas. Para el microservicio se utiliza la base de datos PostgreSQL con Prisma y Redis para guardar en cache los datos de las tareas y que las consultas se realicen más rápido. Las tareas siempre se podran modificar o eliminar dependiendo del rol que tenga, el usuario, si se le ha asginado o es el autor de esta. El rol admin tendrá acceso a todas las funciones. El rol manager tendrá acceso a todas las funciones de las que tenga permiso, que más abajo se detallan y a las tareas de las que sea autor o se le han asignado. El rol user tendrá acceso a las funciones de las que tiene permiso y a las tareas que le hayan asignado.

Este servicio se encarda de: 

- Crear tareas.
- Actualizar tareas.
- Eliminar tareas.
- Cambiar el estado de una tarea.
- Asignar tareas a usuarios.
- Buscar tareas.
- Buscar tareas individualmente.
- Buscar tareas por autor.
- Buscar tareas asignadas a un usuario.
- Cambiar el estado de una tarea.
- Asignar el usuario de una tarea.

### 4. Logs

El servicio de gestión de logs se encarga de almacenar los registros de eventos y los enviar a la base de datos. El microservicio está creado sobre una base de datos MongoDB. Está planteado con una estructura sencilla por si más tarde se quiere implementar Prometheus o Grafana para monitoreo. El servicio se encarga de:

- Almacenar los registros de eventos en la base de datos con un request_id para identificar el evento.
- Pueden ser de tipo error o info.
 - Error: Se registra cuando ocurre un error en el servicio.
 - Info: Se registra cuando se realiza una operación en el servicio y es correcto o da como resultado un error controlado.
 - Sigue la siguiente arquitectura:
  ```
  {
    "_id", -> Identificador único del evento
    "level", -> "INFO" o "ERROR"
    "message", -> Mensaje del evento
    "request_id", -> Identificador del registro del evento
    "user_id", -> Identificador del usuario que realizó la operación
    "event_type", -> Tipo de evento
    "service_name", -> Nombre del servicio que emitió el evento
    "details", -> Datos adicionales del evento
    "createdAt", -> Fecha de creación del evento
    "updatedAt" -> Fecha de actualización del evento
  }
  ```

### 5. Notifications

El servicio de notificaciones se encarga de enviar notificaciones en tiempo real a los usuarios.

- Enviar un email cunando se registra un usuario o se le asigna una tarea.

### 6. Redis

El servicio de caché se encarga de almacenar los datos de la base de datos y los enviar a los microservicios.

### 7. RabbitMQ

El servicio de comunicación entre los microservicios se encarga de utilizar el protocolo de mensajería de RabbitMQ. Incluye RabbitMQ Management para la monitorización y administración a través de una interfaz web.

### 8. MongoDB

La base de datos se encarga de almacenar los datos de los usuarios y los logs.

### 9. PostgreSQL

La base de datos se encarga de almacenar los datos de las tareas.

---

## Instalación

### 1. Clonar el repositorio

```
git clone https://github.com/alejandro-dev/taskflow-nest.git
```

### 2. Ejecutar el proyecto

```
docker-compose up -d
```

Por defecto, el proyecto se inicia en el puerto 3000.

---

## Endpoints
### Authentication

| Método  | Ruta                        | Descripción          |
| ------- | --------------------------- | -------------------- |
| POST    | /auth/register              | Registro de usuario  |
| POST    | /auth/login                 | Inicio de sesión     |
| GET     | /auth/verify-account/:token | Verificar cuenta     |


### Usuarios  

| Método  | Ruta                  | Descripción                 | Roles          |
| ------- | --------------------- |---------------------------- | -------------- |
| GET     | /users?limit=&page=   | Listar todos los usuario    | admin, manager |


### Tareas 

| Método  | Ruta                                       | Descripción                                     | Roles          |
| ------- | ------------------------------------------ | ----------------------------------------------- | -------------- |
| POST    | /api/tasks                                 | Registro de tareas                              | admin, manager |
| GET     | /api/tasks/:id                             | Obtener una tarea                               |                |
| PUT     | /api/tasks/:id                             | Actualizar una tarea                            |                |
| DELETE  | /api/tasks/:id                             | Eliminar una tarea                              | admin, manager |
| GET     | /api/tasks?limit=&page=                    | Obtener todas las tareas                        | admin          |
| GET     | /api/tasks/assigned/:userId?limit=&page=   | Obtener todas las tareas de un usuario          |                |
| GET     | /api/tasks/author/:authorId?limit=&page=   | Obtener todas las tareas de un autor de tareas  | admin, manager |
| PATCH   | /api/tasks/:taskId/change-status           | Modificar el estado de una tarea                |                |
| PATCH   | /api/tasks/:taskId/assign-user             | Asignar un usuario a una tarea                  | admin, manager |
