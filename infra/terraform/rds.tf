# 1. DB Subnet Group (RDS must span multiple AZs in the VPC)
resource "aws_db_subnet_group" "rds" {
  name       = "${var.environment}-rds-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "${var.environment}-rds-subnet-group"
  }
}

# 2. Security Group for RDS MySQL
resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-security-group"
  description = "Access control for MySQL RDS instance"
  vpc_id      = aws_vpc.main.id

  # Allow incoming traffic only on port 3306 from the EKS Cluster security group
  ingress {
    description     = "Allow MySQL traffic from EKS cluster nodes"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_eks_cluster.eks.vpc_config[0].cluster_security_group_id]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-rds-security-group"
  }
}

# 3. RDS MySQL Instance
resource "aws_db_instance" "mysql" {
  identifier             = "${var.environment}-mysql-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  # Ensure the database is isolated in private database subnets
  publicly_accessible    = false
  
  # For ease of cleaning up resources in development/demos
  skip_final_snapshot    = true
  deletion_protection    = false

  tags = {
    Name = "${var.environment}-mysql"
  }
}
