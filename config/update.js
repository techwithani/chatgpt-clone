const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { askQuestion, isDockerRunning, silentExit } = require('./helpers');

const config = {
  localUpdate: process.argv.includes('-l'),
  dockerUpdate: process.argv.includes('-d'),
  useSingleComposeFile: process.argv.includes('-s'),
};

// Set the directories
const rootDir = path.resolve(__dirname, '..');
const directories = [
  rootDir,
  path.resolve(rootDir, 'packages', 'data-provider'),
  path.resolve(rootDir, 'client'),
  path.resolve(rootDir, 'api'),
];

async function updateConfigWithWizard() {
  if (!config.dockerUpdate && !config.useSingleComposeFile) {
    config.dockerUpdate = (await askQuestion('Are you using Docker? (y/n): '))
      .toLowerCase()
      .startsWith('y');
  }

  if (config.dockerUpdate && !config.useSingleComposeFile) {
    config.useSingleComposeFile = !(
      await askQuestion('Are you using the default docker-compose file? (y/n): ')
    )
      .toLowerCase()
      .startsWith('y');
  }
}

async function validateDockerRunning() {
  if (!config.dockerUpdate && config.useSingleComposeFile) {
    config.dockerUpdate = true;
  }

  if (config.dockerUpdate && !isDockerRunning()) {
    console.red(
      'Error: Docker is not running. You will need to start Docker Desktop or if using linux/mac, run `sudo systemctl start docker`',
    );
    silentExit(1);
  }
}

function deleteNodeModules(dir) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.purple(`Deleting node_modules in ${dir}`);
    execSync(`rd /s /q "${nodeModulesPath}"`, { stdio: 'inherit', shell: 'cmd.exe' });
  }
}

(async () => {
  const showWizard = !config.localUpdate && !config.dockerUpdate && !config.useSingleComposeFile;

  if (showWizard) {
    await updateConfigWithWizard();
  }

  await validateDockerRunning();
  const { dockerUpdate, useSingleComposeFile: singleCompose } = config;

  // Fetch latest repo
  console.purple('Fetching the latest repo...');
  execSync('git fetch origin', { stdio: 'inherit' });

  // Switch to main branch
  console.purple('Switching to main branch...');
  execSync('git checkout main', { stdio: 'inherit' });

  // Git pull origin main
  console.purple('Pulling the latest code from main...');
  execSync('git pull origin main', { stdio: 'inherit' });

  if (dockerUpdate) {
    console.purple('Removing previously made Docker container...');
    const downCommand = `docker-compose ${
      singleCompose ? '-f ./docs/dev/single-compose.yml ' : ''
    }down --volumes`;
    console.orange(downCommand);
    execSync(downCommand, { stdio: 'inherit' });
    console.purple('Pruning all AnirudhGPT Docker images...');

    const imageName = singleCompose ? 'librechat_single' : 'librechat';
    try {
      execSync(`docker rmi ${imageName}:latest`, { stdio: 'inherit' });
    } catch (e) {
      console.purple('Failed to remove Docker image librechat:latest. It might not exist.');
    }
    console.purple('Removing all unused dangling Docker images...');
    execSync('docker image prune -f', { stdio: 'inherit' });
    console.purple('Building new AnirudhGPT image...');
    const buildCommand = `docker-compose ${
      singleCompose ? '-f ./docs/dev/single-compose.yml ' : ''
    }build`;
    console.orange(buildCommand);
    execSync(buildCommand, { stdio: 'inherit' });
  } else {
    // Delete all node_modules
    directories.forEach(deleteNodeModules);

    // Run npm cache clean --force
    console.purple('Cleaning npm cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    // Install dependencies
    console.purple('Installing dependencies...');
    execSync('npm ci', { stdio: 'inherit' });

    // Build client-side code
    console.purple('Building frontend...');
    execSync('npm run frontend', { stdio: 'inherit' });
  }

  let startCommand = 'npm run backend';
  if (dockerUpdate) {
    startCommand = `docker-compose ${singleCompose ? '-f ./docs/dev/single-compose.yml ' : ''}up`;
  }
  console.green('Your AnirudhGPT app is now up to date! Start the app with the following command:');
  console.purple(startCommand);
  console.orange(
    'Note: it\'s also recommended to clear your browser cookies and localStorage for AnirudhGPT to assure a fully clean installation.',
  );
  console.orange('Also: Don\'t worry, your data is safe :)');
})();
