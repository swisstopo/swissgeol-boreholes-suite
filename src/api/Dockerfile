FROM mcr.microsoft.com/dotnet/sdk:6.0 AS development
WORKDIR /src
ARG VERSION
ARG REVISION

# Install missing packages
RUN \
  DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y curl && \
  rm -rf /var/lib/apt/lists/*

# Set default shell
SHELL ["/bin/bash", "-c"]

# Restore dependencies and tools
COPY BDMS.csproj .
RUN dotnet restore "BDMS.csproj"

# Set environment variables
ENV PUBLISH_DIR=/app/publish

# Create optimized production build
COPY . .
RUN dotnet publish "BDMS.csproj" \
  -c Release \
  -p:UseAppHost=false \
  -p:VersionPrefix=${VERSION} \
  -p:SourceRevisionId=${REVISION} \
  -o ${PUBLISH_DIR}

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS deploy
ENV HOME=/app
ENV TZ=Europe/Zurich
ENV ASPNETCORE_ENVIRONMENT=Production
WORKDIR ${HOME}

EXPOSE 80

# Set default locale
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY --from=development /app/publish $HOME

HEALTHCHECK CMD curl --fail http://localhost/ || exit 1

ENTRYPOINT ["dotnet", "BDMS.dll"]
