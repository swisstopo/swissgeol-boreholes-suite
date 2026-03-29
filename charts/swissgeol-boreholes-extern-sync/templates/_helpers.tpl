{{/*
  resolve-secret: Three-tier secret resolution.
    1. --set override (from .Values)
    2. Existing secret value (from lookup)
    3. Fallback placeholder

  Usage:
    {{ include "resolve-secret" (dict "override" .Values.some.key "existing" $existing "key" "secretKey" "fallback" "CHANGE_ME") }}
*/}}
{{- define "resolve-secret" -}}
{{- if .override -}}
  {{- .override | toString | b64enc -}}
{{- else if (and .existing (hasKey .existing .key)) -}}
  {{- index .existing .key -}}
{{- else -}}
  {{- .fallback | b64enc -}}
{{- end -}}
{{- end -}}
