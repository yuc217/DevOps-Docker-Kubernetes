import { KubeConfig, AppsV1Api, CoreV1Api, CustomObjectsApi, Watch } from '@kubernetes/client-node';
import { V1ConfigMap, V1Deployment } from '@kubernetes/client-node';
import axios from 'axios';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(AppsV1Api);
const k8sCoreApi = kc.makeApiClient(CoreV1Api);
const customObjectsApi = kc.makeApiClient(CustomObjectsApi);

async function watchDummySites() {
  const watch = new Watch(kc);
  watch.watch(
    '/apis/example.com/v1/dummysites',
    {},
    async (type, obj) => {
      if (type === 'ADDED' || type === 'MODIFIED') {
        await handleDummySite(obj);
      }
    },
    (err) => {
      console.error('Error DummySites:', err);
    }
  );
}

async function handleDummySite(dummysite) {
  const { website_url: websiteUrl } = dummysite.spec;
  const namespace = dummysite.metadata.namespace;
  const name = dummysite.metadata.name;

  try {
    const response = await axios.get(websiteUrl);
    const htmlContent = response.data;

    const configMap = new V1ConfigMap();
    configMap.metadata = { name, namespace };
    configMap.data = { 'index.html': htmlContent };
    await k8sCoreApi.createNamespacedConfigMap(namespace, configMap);

    const deployment = new V1Deployment();
    deployment.metadata = { name, namespace };
    deployment.spec = {
      replicas: 1,
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          containers: [
            {
              name: 'nginx',
              image: 'nginx:latest',
              volumeMounts: [
                {
                  name: 'html',
                  mountPath: '/usr/share/nginx/html',
                },
              ],
            },
          ],
          volumes: [
            {
              name: 'html',
              configMap: { name },
            },
          ],
        },
      },
    };
    await k8sApi.createNamespacedDeployment(namespace, deployment);
  } catch (error) {
    console.error('Error DummySite:', error);
}
}

watchDummySites();
