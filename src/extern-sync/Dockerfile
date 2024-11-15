# syntax=docker/dockerfile:1.7-labs

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG VERSION
ARG REVISION
WORKDIR /src

# Restore dependencies and tools
COPY --parents "extern-sync/BDMS.ExternSync.csproj" "api/BDMS.csproj" ./
RUN dotnet restore "./extern-sync/BDMS.ExternSync.csproj"

# Create optimized production build
COPY --parents "extern-sync/" "api/" ./
RUN dotnet publish "./extern-sync/BDMS.ExternSync.csproj" \
  -c Release \
  -p:UseAppHost=false \
  -p:VersionPrefix=${VERSION} \
  -p:SourceRevisionId=${REVISION} \
  -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS deploy
ENV ASPNETCORE_ENVIRONMENT=Production
WORKDIR /app

# Set default locale
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY --from=build /app/publish .

# Switch to the non-root user 'app' defined in the base image
USER $APP_UID
ENTRYPOINT ["dotnet", "BDMS.ExternSync.dll"]
