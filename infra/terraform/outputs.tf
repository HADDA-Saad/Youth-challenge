# ==============================================================================
# VPC Outputs
# ==============================================================================
output "vpc_id" {
  description = "The ID of the custom VPC"
  value       = aws_vpc.main.id
}

# ==============================================================================
# EKS Outputs
# ==============================================================================
output "eks_cluster_name" {
  description = "The name of the EKS Cluster"
  value       = aws_eks_cluster.eks.name
}

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS Cluster control plane"
  value       = aws_eks_cluster.eks.endpoint
}

output "eks_cluster_security_group_id" {
  description = "Security Group ID attached to the EKS Cluster control plane"
  value       = aws_eks_cluster.eks.vpc_config[0].cluster_security_group_id
}

# ==============================================================================
# RDS Outputs
# ==============================================================================
output "rds_endpoint" {
  description = "The connection endpoint for the RDS MySQL instance"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_address" {
  description = "The hostname of the RDS MySQL instance"
  value       = aws_db_instance.mysql.address
}

# ==============================================================================
# ECR Outputs
# ==============================================================================
output "ecr_backend_repository_url" {
  description = "The repository URL for the backend Docker image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "The repository URL for the frontend Docker image"
  value       = aws_ecr_repository.frontend.repository_url
}
