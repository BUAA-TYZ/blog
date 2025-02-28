---
date: 2025-01-04
category:
  - 云
tag:
  - k8s
  - prometheus
  - grafana
  - helm
  - harbor
footer: 凉了的馒头
---

# 云上工具

## [Docker](https://vuepress.mirror.docker-practice.com/)

- 相关概念：
  - 镜像和容器
  - 容器是镜像的实例
- 镜像是分层的，容器是在镜像的基础上加了一层
- 通过 Dockerfile 创建**可维护**的镜像
- 通过 Linux 的 Namespace 等技术实现容器级的虚拟化
- 需要代理加速，维护这两个环境变量 `HTTP_PROXY，HTTPS_PROXY`

## [K8s](https://kubernetes.io/zh-cn/)

- 管理**容器化**的工作和服务

- 自动部署到不同的节点，自动实现负载均衡，容灾管理等

- 相关概念

  - `Pod`：一组紧密关联的容器集合，是 Kubernetes 调度的基本单位。Pod 的设计理念是支持多个容器在一个 Pod 中**共享网络和文件系统**

    - 主要两种用法：运行单个容器的 pod（最常见），运行多个紧密联系的容器
    - 共享 IPC 和 Network namespace（可 localhost 通信）
    - 所有 Pod 内容器都可以访问共享的 Volume，可以访问共享数据
    - 优雅终止：Pod 删除的时候先给其内的进程发送 SIGTERM，等待一段时间（grace period）后才强制停止依然还在运行的进程
    - 模板
      - `containerPort`：表示容器内部应用监听的端口，即**容器内访问的端口。**这个是 **[informational](https://stackoverflow.com/questions/57197095/why-do-we-need-a-port-containerport-in-a-kuberntes-deployment-container-definiti)** 的（但可以多加一个 name，使 service 能通过 name 绑定转发 ip）

  - `Deployment`：用于管理运行一个应用负载的一组 Pod，通常适用于不保持状态的负载。管理一个 rs，它支持滚动更新等高级特性 

  - `ReplicaSet`：维持在任何给定时间运行的一组**稳定**的副本 Pod。 通常用 Deployment 自动管理。

  - `DameonSet`：定义了提供节点本地设施的 Pod。每个 node 跑一个这个 Pod

  - `Service`：向外提供一个地址，将对该地址的请求转发至指定的 Pod 中，也可以通过服务名称访问

    - 模板
      - `type`：
        - `ClusterIP`：通过集群的内部 IP 公开 Service，选择该值时 Service 只能够在集群内部访问。通过 Ingress 可以公开服务
        - `NodePort`: 使可以通过 `节点IP:port` 的方式访问服务
      - `port`：向外暴露的端口
      - `targetPort`：转发到 pod 的端口，可以是 name

  - `Ingress`：提供从集群外部到集群内服务的 HTTP 和 HTTPS 路由，需要有一个 **ingress controller**

    - ```YAML
      apiVersion: networking.k8s.io/v1
      kind: Ingress
      metadata:
        name: sat-edge-develop
        namespace: sat
        annotations:
          kubernetes.io/ingress.class: "traefik"
      spec:
        rules:
        - host: k3s.act.buaa.edu.cn
          http:
            paths:
            - path: /images
              pathType: Prefix
              backend:
                service:
                  name: dota-nginx-service
                  port:
                    number: 80
      ```

  - `volume`：让一组容器得以共享数据

    - `configmap`：将（非机密）配置挂载到指定位置供容器使用

    - `secret`：用于机密配置

    - `Persistent Volume（持久卷）`：这是集群资源，需要通过`PV Claim`来申领，可以通过 `StorageClass` 来动态制备

      - 这也是将持久化存储附加到一个容器的最佳方法：

        - 管理员设置持久卷制备程序，即 **provisioner**
        - 管理员创建 `StorageClass` 
        - 用户进行 PVC 来申领持久卷
        - 最终持久卷和 Pod 解耦

      - ```YAML
        allowVolumeExpansion: true
        apiVersion: storage.k8s.io/v1
        kind: StorageClass
        metadata:
          annotations:
            meta.helm.sh/release-name: nfs-provisioner
            meta.helm.sh/release-namespace: kube-system
          creationTimestamp: "2024-10-18T02:23:56Z"
          labels:
            app: nfs-subdir-external-provisioner
            app.kubernetes.io/managed-by: Helm
            chart: nfs-subdir-external-provisioner-4.0.18
            heritage: Helm
            release: nfs-provisioner
          name: nfs-client
          resourceVersion: "75320"
          uid: 4944bd0b-e318-4ea3-9011-916aac8f67f0
        parameters:
          archiveOnDelete: "true"
        provisioner: cluster.local/nfs-provisioner-nfs-subdir-external-provisioner
        reclaimPolicy: Retain
        volumeBindingMode: Immediate
        ```

      - 

      - ```YAML
        apiVersion: v1
        kind: PersistentVolumeClaim
        metadata:
          name: dota-source-imgs
          namespace: sat-edge
        spec:
          accessModes:
            - ReadWriteMany
          resources:
            requests:
              storage: 15Gi
          storageClassName: nfs-client
        ```

## [Prometheus](https://prometheus.ac.cn/)

- 一个监控工具，可以监控 K8s，比如监控K8s每个节点的硬件信息

- 搭档 Grafana，一个数据可视化的工具

- [Python client](https://prometheus.github.io/client_python/)

  - 写的过程就是将数据用其提供的指标收集起来，然后每次采集暴露最新的数据即可

  - ```Python
    random_value = Gauge('random_integer', 'A random integer that changes over time')
    
    @app.route('/metrics')
    def metrics():
        return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)
    ```

## [Helm](https://helm.sh/zh/docs/)

- K8s 的包管理器
- 相比直接使用 `kubectl apply -f` 来手动部署 YAML 文件，Helm 的优势在于它将复杂的 Kubernetes 配置和部署过程抽象化，简化了集群管理。
- 相关概念
  - `chart`：代表 Helm 包，类似模板，封装 Kubernetes 的资源定义，包括 Pods、Services、Ingress 等 Kubernetes 资源
  - `Repository`：存放 chart 的地方
  - `Release`：chart 实例

## Harbor

- 企业级的镜像仓库
- 可以用来做私有化镜像仓库
- E.g. Push dota-1 dota-2 dota-3 后配置 Docker 从该私有化镜像仓库拉取镜像