{{/*
 Secret names
*/}}
{{- define "postgres.secretName" -}}
{{ include "immich.fullname" . }}-postgres
{{- end }}

{{- define "redis.secretName" -}}
{{ include "immich.fullname" . }}-redis
{{- end }}
