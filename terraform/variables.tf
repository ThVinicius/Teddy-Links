variable "project_id" {
  description = "Your GCP Project ID"
  type        = string
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region for the cluster (e.g., us-central1)"
  type        = string
}