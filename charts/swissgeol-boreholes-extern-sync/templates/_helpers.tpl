{{/*
  resolve-secret-plain: resolve a secret to plaintext. Precedence: --set override,
  then existing in-cluster Secret value, then fallback, else fail. An empty stored
  value counts as absent, so a required key (no fallback) fails rather than write a
  blank. Each key resolves independently.
*/}}
{{- define "resolve-secret-plain" -}}
{{- $existingValue := "" -}}
{{- if (and .existing (hasKey .existing .key)) -}}
  {{- $existingValue = index .existing .key | b64dec -}}
{{- end -}}
{{- if .override -}}
  {{- .override | toString -}}
{{- else if $existingValue -}}
  {{- $existingValue -}}
{{- else if (hasKey . "fallback") -}}
  {{- .fallback | toString -}}
{{- else -}}
  {{- fail (printf "Missing required secret %q: not provided via '--set %s=<value>' and the existing cluster Secret has no non-empty value for it. Set it and redeploy. Deploy aborted to avoid writing an empty value." .key .valuesPath) -}}
{{- end -}}
{{- end -}}

{{/* resolve-secret: base64 of resolve-secret-plain, for storing one field in a Secret. */}}
{{- define "resolve-secret" -}}
{{- include "resolve-secret-plain" . | b64enc -}}
{{- end -}}
