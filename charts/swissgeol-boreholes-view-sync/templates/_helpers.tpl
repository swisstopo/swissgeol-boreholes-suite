{{/*
  resolve-secret: Three-tier secret resolution.
    1. --set override (from .Values)
    2. Existing secret value (from lookup)
    3. Fallback — if provided, use it; if omitted, fail with a clear error

  Usage (required key, fails if missing):
    {{ include "resolve-secret" (dict "override" .Values.x "existing" $existing "key" "secretKey" "valuesPath" "x") }}

  Usage (optional key, falls back to default):
    {{ include "resolve-secret" (dict "override" .Values.x "existing" $existing "key" "secretKey" "fallback" "default") }}
*/}}
{{- define "resolve-secret" -}}
{{- if .override -}}
  {{- .override | toString | b64enc -}}
{{- else if (and .existing (hasKey .existing .key)) -}}
  {{- index .existing .key -}}
{{- else if (hasKey . "fallback") -}}
  {{- .fallback | toString | b64enc -}}
{{- else -}}
  {{- fail (printf "Required secret key %q is not set. Supply via --set %s=<value> or pre-populate the key in the existing Secret before upgrading." .key .valuesPath) -}}
{{- end -}}
{{- end -}}
