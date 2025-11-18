pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install deps') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline ejecutada correctamente"
        }
        failure {
            echo "❌ Error en la pipeline (ver Console Output)"
        }
    }
}
