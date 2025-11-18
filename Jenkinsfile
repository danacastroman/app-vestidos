pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Clonando repositorio..."
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                echo "📦 Instalando dependencias..."
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo "🏗️ Construyendo aplicación..."
                sh 'npm run build'
            }
        }

        stage('Test (optional)') {
            when {
                expression { fileExists('package.json') && readFile('package.json').contains('"test"') }
            }
            steps {
                echo "🧪 Ejecutando tests..."
                sh 'npm test --if-present'
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline ejecutada correctamente"
        }
        failure {
            echo "❌ Error en la pipeline"
        }
    }
}
