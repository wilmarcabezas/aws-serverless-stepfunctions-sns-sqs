# AWS Serverless Step Functions con SNS y SQS  🚀

Este repositorio proporciona un ejemplo de cómo utilizar los servicios de AWS Step Functions, SNS y SQS para crear un flujo de trabajo serverless.

## ¿Qué son AWS Step Functions?

AWS Step Functions es un servicio de AWS que le permite definir y ejecutar flujos de trabajo de manera fácil y segura

## ¿Qué son SNS y SQS?

SNS (Simple Notification Service) es un servicio de AWS que le permite enviar mensajes a una o varias suscripciones. Puede utilizar SNS para enviar notificaciones por correo electrónico, SMS, mensajes a aplicaciones móviles y más.

SQS (Simple Queue Service) es un servicio de AWS que le permite crear colas de mensajes para almacenar y transmitir información de manera segura. Puede utilizar SQS para procesar y transmitir mensajes de manera asíncrona.

## ¿Cómo funciona este ejemplo?

En este ejemplo, se utiliza una función de AWS Lambda para enviar un mensaje a un tópico de SNS. Luego, se configura una suscripción de SQS a ese tópico de SNS para que reciba el mensaje. Finalmente, se utiliza una función de AWS Lambda para procesar el mensaje de la cola de SQS.

Aquí está un diagrama que muestra el flujo de trabajo completo:

![Diagrama de flujo de trabajo de Step Functions](https://firebasestorage.googleapis.com/v0/b/pruebaimagen-b71c9.appspot.com/o/stepfunctions_graph.png?alt=media&token=62832d6d-ca20-48ca-ae7a-f6547b5de00f)

## ¿Cómo utilizar este repositorio?

Para utilizar este repositorio, primero debe clonarlo y luego seguir las instrucciones del archivo `README.md`. Asegúrate de tener una cuenta de AWS y haber configurado la CLI de AWS.

Una vez que hayas configurado el proyecto, puedes utilizar el archivo `serverless.yml` para desplegar el flujo de trabajo en tu cuenta de AWS.

¡Espero que encuentres este ejemplo útil y que puedas utilizarlo como base para tus propios proyectos de flujos de trabajo serverless! 💪
