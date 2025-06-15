terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
  backend "gcs" {
    bucket = "${var.project_id}-terraform-state"
    prefix = "terraform/state" 
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
}

resource "google_project_service" "gke_api" {
  project = var.project_id
  service = "container.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "compute_api" {
  project = var.project_id
  service = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  project = var.project_id
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.gcp_region 

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 20
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  initial_node_count = 1

  deletion_protection = false 

  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "Allow all"
    }
  }

  depends_on = [
    google_project_service.gke_api,
    google_project_service.compute_api,
    google_project_service.artifact_registry_api
  ]

  lifecycle {
    ignore_changes = [
      initial_node_count
    ]
  }
}

resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.gcp_region
  repository_id = "url-shortener-repo"
  description   = "Docker repository for URL Shortener application"
  format        = "DOCKER"
}