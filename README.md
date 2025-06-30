# Full Stack CRUD Application on AWS with ECS & RDS

This guide walks through deploying a full-stack **CRUD application** using **React**, **Node.js + Express**, **MySQL**, and **Docker** — all orchestrated on **AWS ECS** with **RDS**, **ALB**, and **Fargate**.

🔗 Original Source Repo: [react-node-mysql-crud](https://github.com/nailtonvital/react-node-mysql-crud)

---

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: MySQL (via Amazon RDS)
- **Containers**: Docker
- **Orchestration**: AWS ECS + Fargate
- **Load Balancing**: Application Load Balancer (ALB)

---

## Local Development via Docker

### Backend
```bash
docker build -t my-backend .
docker run -d --name backend -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=Sirsatti123! \
  -e DB_NAME=crudgames \
  my-backend
```

### Frontend
```bash
docker build -t my-frontend .
docker run -d --name frontend -p 5173:80 my-frontend
```

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`.env`)
```env
DB_HOST=mysql
DB_USER=myappuser
DB_PASSWORD=yourpassword
DB_DATABASE=crudgames
DB_PORT=3306
```

---

## AWS Infrastructure Setup

### Step 1: VPC & Security Groups
- Use Default VPC
- **ALB-SG**: Allow TCP 80/443/3001 from 0.0.0.0/0
- **RDS-SG**: Allow TCP 3306 from ALB-SG

---

### Step 2: RDS MySQL

1. Create a **DB Subnet Group**
2. Create a **MySQL Instance**:
   - Version: 8.0.36
   - Identifier: `crudgames-db`
   - Username: `admin`
   - Password: `YourSecurePassword123!`
   - Subnet Group: `crud-app-subnet-group`
   - DB Name: `crudgames`
   - Public Access: No (or Yes for testing)
   - Security Group: `RDS-SG`

**Environment Variables:**
```env
DB_HOST=crudgames-db.xxxxxx.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=crudgames
DB_PORT=3306
```

---

### Step 3: ECR Setup

#### Frontend
```bash
docker build -t react-crud-frontend .
docker tag react-crud-frontend:latest <AWS_ID>.dkr.ecr.us-east-1.amazonaws.com/react-crud-frontend:latest
docker push <AWS_ID>.dkr.ecr.us-east-1.amazonaws.com/react-crud-frontend:latest
```

#### Backend
```bash
docker build -t node-crud-backend .
docker tag node-crud-backend:latest <AWS_ID>.dkr.ecr.us-east-1.amazonaws.com/node-crud-backend:latest
docker push <AWS_ID>.dkr.ecr.us-east-1.amazonaws.com/node-crud-backend:latest
```

---

### Step 4: Create Load Balancer

- **ALB**: Internet-facing, ports 80 & 3001
- **Target Groups**:
  - `frontend-tg`: HTTP, port 3000
  - `backend-tg`: HTTP, port 5000

---

### Step 5: ECS Task Definitions

#### Frontend
- Task Role: `ecsTaskExecutionRole`
- Port Mapping: 80
- Image: from ECR

#### Backend
- Port Mapping: 3001
- Environment:
```env
DB_HOST=<your-rds-endpoint>
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=crudgames
```

---

### Step 6: ALB Listener Rules

Create path-based routing:
- `/register/*`
- `/games/*`
- `/edit/*`
- `/delete/*`

---

### Step 7: ECS Services & Cluster

1. **Cluster**: `crud-app-cluster` (Fargate)
2. **Frontend Service**:
   - Task: `frontend-task`
   - Target Group: `frontend-tg`

3. **Backend Service**:
   - Task: `backend-task`
   - Target Group: `backend-tg`
   - Service Discovery:
     - Namespace: `backend.local`
     - Record type: `A`
     - proxy_pass: `http://backend.backend.local:3001`

---

## Testing

Visit the ALB DNS to access the deployed CRUD application via browser.

---

## Cleanup Steps

- Delete ECS services
- Delete task definitions
- Delete ALB and target groups
- Delete RDS instance

---

## Future Enhancements

- CI/CD via GitHub Actions
- Infrastructure-as-Code with Terraform
