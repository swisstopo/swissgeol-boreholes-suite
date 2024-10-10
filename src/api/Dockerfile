FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development
ENV ASPNETCORE_ENVIRONMENT=Development
WORKDIR /src

# Install missing packages
RUN apt-get -y update
RUN apt-get -y install git vim curl htop
RUN dotnet tool install --global dotnet-ef --version 8.0.0
ENV PATH=$PATH:/root/.dotnet/tools

# Restore dependencies and tools
COPY BDMS.csproj .
RUN dotnet restore

ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG VERSION
ARG REVISION
WORKDIR /src

# Restore dependencies and tools
COPY BDMS.csproj .
RUN dotnet restore

# Create optimized production build
COPY . .
RUN dotnet publish \
  -c Release \
  -p:UseAppHost=false \
  -p:VersionPrefix=${VERSION} \
  -p:SourceRevisionId=${REVISION} \
  -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS deploy
ENV ASPNETCORE_ENVIRONMENT=Production
WORKDIR /app

# Install missing packages
RUN \
  DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y curl && \
  rm -rf /var/lib/apt/lists/*

EXPOSE 8080

# Set default locale
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY --from=build /app/publish .

HEALTHCHECK CMD ["bash", "-c", "curl --fail http://localhost:8080/health || exit 1"]

# Switch to the non-root user 'app' defined in the base image
USER $APP_UID
ENTRYPOINT ["dotnet", "BDMS.dll"]
