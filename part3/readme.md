### Exercise 3.06: DBaaS vs DIY

Database as a Service (DBaaS) like Google Cloud SQL: 
As a managed service, Google Cloud SQL handles the underlying infrastructure, including automatic backups, updates, and maintenance. Don't have to worry about the operations of the database, can focus more on application development. Also, Google Cloud SQL provides built-in high availability and failover support, ensuring that database remains operational during hardware failures. Security is also an advantage with managed security patches and updates. It also has automatic backups and point-in-time recovery options.

One of the main drawbacks is the cost, which could be higher compared to managing your own database on Kubernetes, especially for large-scale deployments. There are additional costs for data transfer and storage. It also comes with limited customization with less control over the database configuration and tuning, and you are limited to the features and versions supported by Google Cloud SQL.

PersistentVolumeClaims (PVCs) with PostgreSQL on GKE:
Managing your own database on Kubernetes can be more cost-effective, especially for large-scale deployments. You have full control over the infrastructure and database configuration. This approach offers more flexibility, as it can be easily integrated with other Kubernetes resources and tools. 

Managing the database infrastructure requires more manual effort and expertise. You need to handle failover, and scaling manually, which can be a lot of work. Maintenance is also a concern, it needs more monitoring and managing the database health and performance continuously. Backup and recovery are also more complex, seting up and managing backup all require manual work.