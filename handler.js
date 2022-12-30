//AWS = Libreria para integrar los servicios de AWS
const AWS = require("aws-sdk");
//Instancio un objeto de tipo AWS StepFunctions
const StepFunction = new AWS.StepFunctions();
//Instancio un objeto de tipo DynamoDB
const DynamoDB = require("aws-sdk/clients/dynamodb");
//A partir del objeto DynamoDB creo el objeto sobre el cual realizar CRUD
const DocumentClient = new DynamoDB.DocumentClient({ region: "us-east-1" });


//Esta funcion verifica si un libro tiene o no Stock disponible.
//Devuelve un true si la cantidad del libro solicitada es inferior a la cantidad de libros actual
const isBookAvailable = (book, quantity) => {
    return (book.quantity - quantity) > 0
}


//Funcion de verificacion de Inventario
//Recibe un Id del Libro para consultar y la cantidad que se vendera
module.exports.checkInventory = async ({ bookId, quantity }) => {
    try {

        //Objeto para la consulta a la tabla DynamoDB de Libros
        //Condicion de filtro: KeyConditionExpression: 'bookId = :bookId',
        //Valores de dicha condicion: ExpressionAttributeValues: { ':bookId': bookId }
        //Tenga presente que los parametros en DynamoDB van con :name
        let params = {
            TableName: 'bookTable',
            KeyConditionExpression: 'bookId = :bookId',
            ExpressionAttributeValues: {
                ':bookId': bookId
            }
        };
        //Realizo la consulta al objeto DocumentCliente mediante el metodo query(params). Este metodo es asyncrono y devuelve una promesa
        let result = await DocumentClient.query(params).promise();
        //El resultado lo asigno al objeto libro (book) trayendo el Items[0] de result
        let book = result.Items[0];


        //Pregunto si el libro que acabo de obtener de la consulta y la cantidad que recibo como parametro en esta funcion,
        //cumplen la condicion de la funcion isBookAvailable book.quantity - quantity > 0
        //Si es asi retorna el libro y la funcion finaliza.
        if (isBookAvailable(book, quantity)) {
            return book;
        } else {
            //En caso de no ser asi se genera un error de tipo "El libro no tiene Stock"
            //Este error se captura en un objeto de tipo Error y se le asigna 
            //el nombre "BookOutOfStock". Este objeto es devuelto y las stepFunctions lo tendran en cuenta
            //en el manejo de pasos correspondientes. Este error nos llevara al catch de este try
            let bookOutOfStockError = new Error("The book is out of stock");
            bookOutOfStockError.name = "BookOutOfStock";
            throw bookOutOfStockError;
        }
    } catch (e) {
        //Si el error es de tipo "BookOutOfStock" entonces lo devuelve
        if (e.name === 'BookOutOfStock') {
            throw e;
        } else {
            //Si no es de este tipo devuelve un error de tipo "BookNotFound" el cual indica que el id (BookId) que se registro en la funcion
            //no fue hallado en la tabla de DynamoDB.
            //Este error tambien sera manejado dentro del Catch de las StepFuncions.
            let bookNotFoundError = new Error(e);
            bookNotFoundError.name = 'BookNotFound';
            throw bookNotFoundError;
        }
    }
}

//Funcion que calcula el valor total, recibe como parametro el Libro y la cantidad que se va a comprar.
module.exports.calculateTotal = async ({ book, quantity }) => {
    //El console.log para evaluar si esta o no recibiendo el objeto (Por si acaso :) )
    console.log("book: ", book);
    //La variable total calcula el valor del libro por la cantidad y lo retorna
    let total = book.price * quantity;
    return { total }
}

//Funcion de compra realiza por el cliente.
//Esta funcion muestra el mensaje de Compra realizada, pero puede incluir la logica necesaria para establecer una pasarela de pago.
module.exports.billCustomer = async (params) => {
    console.log(params);
    /* En esta seccion se podria realizar la integracion con cualquier canal de pago */
    return "Successfully Billed"
}

//Funcion que deduce (resta) los puntos redimidos por el cliente.
//Recibe el Id del usuario de la tabla de DynamoDB como parametro
const deductPoints = async (userId) => {
    //Objeto para realizar la consulta y actualizacion de puntos, recuerde que el parametro en las Update, Delete, Condition Expression es :name
    //Se actualiza del usuario el campo Puntos a CERO.
    let params = {
        TableName: 'userTable',
        Key: { 'userId': userId },
        UpdateExpression: 'set points = :zero',
        ExpressionAttributeValues: {
            ':zero': 0
        }
    };
    //Metodo asyncrono que actualiza el objeto DocumentCliente, recibe los parametros de la condicion de actualizacion (inlucyendo el Key), es asyncrono y devuelve una promesa.
    await DocumentClient.update(params).promise();
}

//Funcion para la actualizacion de la cantidad de libros, despues de realizada la compra.
//Recibe el Id del Libro y la cantidad de la Orden.
const updateBookQuantity = async (bookId, orderQuantity) => {
    //El siempre confiable console.log para verificar el Id del Libro y la Cantidad de Libros de la Orden
    console.log("bookId: ", bookId);
    console.log("orderQuantity: ", orderQuantity);

    //Objeto para la actualizacion de la tabla bookTable, el campo quantity. Actual
    //El parametro es :orderQuantity de la expresion UpdateExpression
    let params = {
        TableName: 'bookTable',
        Key: { 'bookId': bookId },
        UpdateExpression: 'SET quantity = quantity - :orderQuantity',
        ExpressionAttributeValues: {
            ':orderQuantity': orderQuantity
        }
    };
    //Metodo asyncrono para la actualizacion, devuelve una promesa y recibe los parametros de actualizacion en el objeto params
    await DocumentClient.update(params).promise();
}

//Funcion para redimir (cambiar) los puntos del cliente por el valor de la compra
//Recibe el Id del Usaurio y el Total de la Orden
module.exports.redeemPoints = async ({ userId, total }) => {
    //Mostramos el Id del Usuario
    console.log("userId: ", userId);
    //Objketo OrderTotal es igual al total
    let orderTotal = total.total;
    console.log("orderTotal:", orderTotal);
    try {
        //Objeto con parametros para verificar si el usuario existe. 
        //El Key es el userId que recibimos en la funcion.
        let params = {
            TableName: 'userTable',
            Key: {
                'userId': userId
            }
        };

        //Realizamos la consulta y obtenemos los datos (asyncronos, promesa) en el objeto result
        //Usamos get pues vamos a obtener un solo usuario
        let result = await DocumentClient.get(params).promise();
        //Obtenemos el Item (1 solo ya que la consulta a la tabla pretende obtener un solo usuario) y lo asignmos al iobjeto user
        let user = result.Item;
        console.log("user: ", user);

        //Al objeto puntos le asignamos los puntos del cliente
        const points = user.points;
        console.log("points: ", points);

        //Verifico si la Cantida de la Orden es mayor a los Puntos del Usuario
        //Si es asi, entonces llamo la funcion deductPoints para que el usuario quede con CERO puntos.
        //La funcion es asyncrona por lo tanto utilizo await.
        if (orderTotal > points) {
            await deductPoints(userId);
            //Al objeto orderTotal le resto los puntos. Este proceso disminuye el valor a pagar por el usuario
            orderTotal = orderTotal - points;

            //Retorno este valor y los puntos
            return { total: orderTotal, points }
        } else {
            //Si no es asi, se devuelve un error indicando que el valor de la orden es menor que los puntos a redimir
            throw new Error('Order total is less than redeem points');
        }
    } catch (e) {
        //Si se presenta un error, se devuelve este
        throw new Error(e);
    }
}

//Funcion que restaura los puntos del usuario. 
//Recibe como parametros el Id del Usuario y el Total de Puntos para actualizar
module.exports.restoreRedeemPoints = async ({ userId, total }) => {
    try {
        //Si los puntos existen, entonces crea el objeto de actualizacion.
        //Incluye el Key con el Id del Usuario.
        //Realiza la actualizacion con los campos de UpdateExpression y ExpressionAttributeValues
        //Recuerde que ":point" es el parametro de actualizacion
        if (total.points) {
            let params = {
                TableName: 'userTable',
                Key: { userId: userId },
                UpdateExpression: 'set points = :points',
                ExpressionAttributeValues: {
                    ':points': total.points
                }
            };
            //Realiza la actualizacion sobre la tabla "userTable". Este proceso es asyncrono y devuelve una promesa.
            await DocumentClient.update(params).promise();
        }
    } catch (e) {
        //Si hay un error es devuelto
        throw new Error(e);
    }
}


//Funcion para SQS
//Este servicio permite enviar, almacenar y recibir mensajes entre componentes de software de cualquier volumen
module.exports.sqsWorker = async (event) => {
    try {
        console.log(JSON.stringify(event));
        let record = event.Records[0];
        var body = JSON.parse(record.body);
        
        //Encontramos un destinatario para enviar la orden
        let courier = "wilmar.cabezas";
        //let courier = "<courier email>";

        //Actualizamos la cantidad
        //Enviando el Id del Libro y la Cantidad
        //Este proceso es asyncrono y requiere await
        await updateBookQuantity(body.Input.bookId, body.Input.quantity);

        //Incluyo la informacion a la orden usando el objeto StepFunction y el metodo sendTaskSuccess
        //Este metodo recibe dos parametros en JSON
            //output: El destinatario
            //taskToken: El token de SQS
        //Este metodo es asyncrono y devuelve una promesa
        //sendTaskSuccess
        await StepFunction.sendTaskSuccess({
            output: JSON.stringify({ courier }),
            taskToken: body.Token
        }).promise();
    } catch (e) {
        //Si se presenta un error, entonces usamos el metodo asyncrono de la StepFunction 
        //el parametro sendTaskFailure que recibe error, cause, taskToken
        //sendTaskFailure
        console.log("===== You got an Error =====");
        console.log(e);
        await StepFunction.sendTaskFailure({
            error: "NoCourierAvailable",
            cause: "No couriers are available",
            taskToken: body.Token
        }).promise();
    }
}

//Funcion para restaurar la Cantidad
///Recibe el Id del Libro y la Cantidad
module.exports.restoreQuantity = async ({ bookId, quantity }) => {

    //Objeto para restaurar la Cantidad del Libro,
    //el Key es el Id del Libro y la Cantidad
    //UpdateExpression 'set quantity = quantity + :orderQuantity',
    //ExpressionAttributeValues: {':orderQuantity': quantity}
    let params = {
        TableName: 'bookTable',
        Key: { bookId: bookId },
        UpdateExpression: 'set quantity = quantity + :orderQuantity',
        ExpressionAttributeValues: {
            ':orderQuantity': quantity
        }
    };

    //Realiza la actualizacion en la tabla y retorna el mensaje de Cantidad Restaurada
    await DocumentClient.update(params).promise();
    return "Quantity restored"
}
