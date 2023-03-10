# AWS-Serverless Step Functions con SNS y SQS  馃殌

Este repositorio proporciona un ejemplo de c贸mo utilizar los servicios de AWS Step Functions, SNS y SQS para crear un flujo de trabajo serverless.

## 驴Qu茅 son AWS Step Functions?

AWS Step Functions es un servicio de AWS que le permite definir y ejecutar flujos de trabajo de manera f谩cil y segura.

## 驴Qu茅 son SNS y SQS?

SNS (Simple Notification Service) es un servicio de AWS que le permite enviar mensajes a una o varias suscripciones. Puede utilizar SNS para enviar notificaciones por correo electr贸nico, SMS, mensajes a aplicaciones m贸viles y m谩s.

SQS (Simple Queue Service) es un servicio de AWS que le permite crear colas de mensajes para almacenar y transmitir informaci贸n de manera segura. Puede utilizar SQS para procesar y transmitir mensajes de manera as铆ncrona.

Este repositorio proporciona un ejemplo de c贸mo utilizar los servicios de 

[AWS Step Functions](https://aws.amazon.com/es/step-functions/), 

[SNS (Simple Notification Service)](https://aws.amazon.com/es/sns/) y

[SQS (Simple Queue Service)](https://aws.amazon.com/es/sqs/) para crear un flujo de trabajo serverless.

## 驴C贸mo funciona este ejemplo?

En este ejemplo, se utiliza una funci贸n de AWS Lambda para enviar un mensaje a un t贸pico de SNS. Luego, se configura una suscripci贸n de SQS a ese t贸pico de SNS para que reciba el mensaje. Finalmente, se utiliza una funci贸n de AWS Lambda para procesar el mensaje de la cola de SQS.

Aqu铆 est谩 un diagrama que muestra el flujo de trabajo completo:

![Diagrama de flujo de trabajo de Step Functions](https://firebasestorage.googleapis.com/v0/b/pruebaimagen-b71c9.appspot.com/o/stepfunctions_graph.png?alt=media&token=62832d6d-ca20-48ca-ae7a-f6547b5de00f)

## 驴C贸mo utilizar este repositorio?

Para utilizar este repositorio, primero debe clonarlo y luego seguir las instrucciones del archivo `README.md`. Aseg煤rate de tener una cuenta de AWS y haber configurado la CLI de AWS.

Una vez que hayas configurado el proyecto, puedes utilizar el archivo `serverless.yml` para desplegar el flujo de trabajo en tu cuenta de AWS.

隆Espero que encuentres este ejemplo 煤til y que puedas utilizarlo como base para tus propios proyectos de flujos de trabajo serverless! 馃挭
Si tienes duda puedes contactarme!
