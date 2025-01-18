# helm-charts
Contains Helm charts maintained by myself.

> [!INFO]
> The code is provided as-is with no warranties.

See the README.md in each chart directory for more information.

## Usage
You can add this repository to your [Helm](https://helm.sh/) installation by running the following command:

```bash
helm repo add secustor https://secustor.dev/helm-charts
helm install my-release secustor/<chart>
# or directly the OCI registry
helm install my-release oci://ghcr.io/secustor/helm-charts/<chart>
```
