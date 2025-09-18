## 🚀 Steps to deploy your frontend or backend docker image on EKS (DockerHub + AWS CloudShell)

### Step 1: Prep on Local (already done ✅)

* You built the image
* You pushed it to Docker Hub → `dockerhubusername/webapp:latest`

Done ✅

---

### Step 2: Use AWS CloudShell for EKS

1. **Open CloudShell** in AWS Console.

2. **Install kubectl + eksctl** (on any linux system):

```bash
# Install kubectl
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.30.0/2024-06-11/bin/linux/amd64/kubectl
chmod +x kubectl && sudo mv kubectl /usr/local/bin

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" \
  | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```
```
For windows system, we can directly go to eksctl github repo and download the latest .zip file and add the eksctl.exe file path to environment variable PATH
```

3. **Create EKS Cluster** (takes \~10–15 mins):

```bash
eksctl create cluster --name seminar-cluster --region ap-south-1 --nodes 1 --node-type t3.small
```

4. **Write Deployment YAML** (`deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seminar-webapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: seminar-webapp
  template:
    metadata:
      labels:
        app: seminar-webapp
    spec:
      containers:
      - name: seminar-webapp
        image: dockerhubusername/webapp:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: seminar-service
spec:
  type: LoadBalancer
  selector:
    app: seminar-webapp
  ports:
  - port: 80
    targetPort: 3000
```

5. **Deploy to EKS**:

```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get svc seminar-service
```

6. **Get Public URL**
   Once the `EXTERNAL-IP` shows up under `kubectl get svc`, open it in a browser → 🎉 your app is live!

---
# -
---

## 🚀 Hosting Frontend + Backend on EKS

### Step 1: Docker Images

* Backend → `dockerhubusername/backend:latest`
* Frontend → `dockerhubusername/frontend:latest`

(Both already pushed to Docker Hub ✅)

---

### Step 2: Kubernetes Manifests

#### 1. **Backend Deployment + Service**

`backend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seminar-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: seminar-backend
  template:
    metadata:
      labels:
        app: seminar-backend
    spec:
      containers:
      - name: seminar-backend
        image: dockerhubusername/backend:latest
        ports:
        - containerPort: 5000   # change if your backend runs on another port
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: seminar-backend
  ports:
  - port: 5000
    targetPort: 5000
```

---

#### 2. **Frontend Deployment + Service**

`frontend.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seminar-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: seminar-frontend
  template:
    metadata:
      labels:
        app: seminar-frontend
    spec:
      containers:
      - name: seminar-frontend
        image: dockerhubusername/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: BACKEND_URL
          value: "http://backend-service:5000"   # internal DNS to backend
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: LoadBalancer   # expose to internet
  selector:
    app: seminar-frontend
  ports:
  - port: 80
    targetPort: 3000
```

---

### Step 3: Apply to EKS

```bash
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
```

---

### Step 4: Verify

```bash
kubectl get pods
kubectl get svc
```

* `backend-service` → **ClusterIP** (internal only, frontend calls it inside cluster)
* `frontend-service` → **LoadBalancer**, gives you an **EXTERNAL-IP** (public URL for browser access)

---

## ✅ Final Setup

* Users → `frontend-service` (LoadBalancer → public URL)
* Frontend → calls `http://backend-service:5000` (inside cluster)
* Backend → serves API requests

---

This is the **standard 2-tier EKS deployment** 💡
No need for EC2 or extra networking. Kubernetes services handle DNS (`backend-service` is resolvable inside the cluster).

---