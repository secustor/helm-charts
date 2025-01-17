{{/*
Expand the name of the chart.
*/}}
{{- define "immich.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "immich.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "immich.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "immich.commonLabels" -}}
helm.sh/chart: {{ include "immich.chart" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Common Selector labels
*/}}
{{- define "immich.selectorLabels" -}}
app.kubernetes.io/name: {{ include "immich.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
 Define Immich Server Name
*/}}
{{- define "immich-server.name" -}}
{{- printf "%s-server" (include "immich.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Immich Server labels
*/}}
{{- define "immich-server.labels" -}}
{{ include "immich.commonLabels" . }}
{{ include "immich-server.selectorLabels" . }}
{{- end }}

{{/*
Immich Server Selector labels
*/}}
{{- define "immich-server.selectorLabels" -}}
{{ include "immich.selectorLabels" . }}
app.kubernetes.io/component: server
{{- end }}

{{/*
 Define Immich Machine Learning Name
*/}}
{{- define "immich-machine-learning.name" -}}
{{- printf "%s-machine-learning" (include "immich.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Immich Machine Learning labels
*/}}
{{- define "immich-machine-learning.labels" -}}
{{ include "immich.commonLabels" . }}
{{ include "immich-machine-learning.selectorLabels" . }}
{{- end }}

{{/*
Immich Machine Learning Selector labels
*/}}
{{- define "immich-machine-learning.selectorLabels" -}}
{{ include "immich.selectorLabels" . }}
app.kubernetes.io/component: machine-learning
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "immich.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "immich.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
