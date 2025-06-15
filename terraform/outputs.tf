output "cluster_name" {
  value       = google_container_cluster.primary.name
  description = "The name of the GKE cluster."
}

output "cluster_location" {
  value       = google_container_cluster.primary.location
  description = "The location (region or zone) of the GKE cluster."
}

output "artifact_registry_repo_url" {
  value       = google_artifact_registry_repository.docker_repo.name
  description = "The URL of the Artifact Registry Docker repository."
}