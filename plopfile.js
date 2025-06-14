const { readdirSync, existsSync, mkdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const { Project, SyntaxKind } = require('ts-morph');

module.exports = function (plop) {
  plop.setHelper('eq', (v1, v2) => v1 === v2);
  plop.setHelper('capitalize', text => {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  plop.setHelper('snakeCase', text => {
    if (typeof text !== 'string' || !text) return '';
    return text.replace(/-/g, '_');
  });

  plop.setHelper('camelCase', str => {
    if (typeof str !== 'string' || !str) return '';
    return str
      .toLowerCase()
      .replace(/-([a-z0-9])/g, (match, group1) => group1.toUpperCase());
  });

  plop.setHelper('pascalCase', str => {
    if (typeof str !== 'string' || !str) return '';
    const camel = str
      .toLowerCase()
      .replace(/-([a-z0-9])/g, (match, group1) => group1.toUpperCase());
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  });

  plop.setHelper('kebabCase', str => {
    if (typeof str !== 'string' || !str) return '';
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  });

  function runPrettier(filePath) {
    const absoluteFilePath = join(process.cwd(), filePath);
    if (!existsSync(absoluteFilePath)) {
      console.warn(
        `[Prettier] Arquivo não encontrado para formatação: ${absoluteFilePath}`
      );
      return;
    }
    try {
      execSync(`npx prettier --check "${absoluteFilePath}"`, {
        stdio: 'pipe',
        shell: true,
        cwd: process.cwd()
      });
    } catch (checkError) {
      try {
        execSync(`npx prettier --write "${absoluteFilePath}"`, {
          stdio: 'pipe',
          shell: true,
          cwd: process.cwd()
        });
      } catch (writeError) {
        console.error(
          `[Prettier] ❌ Erro ao formatar ${absoluteFilePath}:`,
          writeError.message
        );
      }
    }
  }

  function getDirectories(sourcePath, filterOut = []) {
    const absoluteSourcePath = join(process.cwd(), sourcePath);
    try {
      if (!existsSync(absoluteSourcePath)) {
        return [];
      }
      let dirs = readdirSync(absoluteSourcePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name)
        .map(dirent => dirent.name)
        .filter(name => typeof name === 'string' && name.trim() !== '');
      if (filterOut.length > 0) {
        dirs = dirs.filter(dir => !filterOut.includes(dir));
      }
      return dirs;
    } catch (err) {
      console.error(`Erro ao ler diretório ${absoluteSourcePath}:`, err);
      return [];
    }
  }

  function ensureDirectoryExists(dirPath) {
    const absoluteDirPath = join(process.cwd(), dirPath);
    if (!existsSync(absoluteDirPath)) {
      mkdirSync(absoluteDirPath, { recursive: true });
      console.log(`Diretório criado: ${absoluteDirPath}`);
    }
  }

  function listFilesBySuffix(directoryPath, suffix) {
    const absoluteDirPath = join(process.cwd(), directoryPath);
    if (!existsSync(absoluteDirPath)) {
      return [];
    }
    try {
      return readdirSync(absoluteDirPath).filter(file => file.endsWith(suffix));
    } catch (error) {
      console.error(`Erro ao ler o diretório ${absoluteDirPath}:`, error);
      return [];
    }
  }

  function getModuleChoices() {
    const modulesBaseDirRelative = 'src/modules';
    const mainModuleNames = getDirectories(modulesBaseDirRelative);
    const choices = [];

    // Adiciona todos os módulos principais (raiz), excluindo "shared"
    mainModuleNames.forEach(mainModuleName => {
      if (mainModuleName === 'shared') return; // 'shared' não é mais uma opção para seleção
      const moduleFilePath = join(
        modulesBaseDirRelative,
        mainModuleName,
        `${mainModuleName}.module.ts`
      );
      if (existsSync(join(process.cwd(), moduleFilePath))) {
        choices.push({
          name: `Módulo Principal: ${mainModuleName}`,
          value: {
            moduleFilePath: moduleFilePath,
            logicBasePath: `src/modules/${mainModuleName}`,
            isRootModule: true,
            ownerName: mainModuleName // Para referências internas no gerador
          }
        });
      }
    });

    if (choices.length === 0) {
      throw new Error(
        'Nenhum módulo principal (raiz) foi encontrado. Crie um módulo principal primeiro com o gerador "modulo".'
      );
    }
    return choices;
  }

  // --- GERADOR DE MÓDULO (RAIZ SIMPLES) ---
  plop.setGenerator('modulo', {
    description:
      'Gera um novo módulo raiz (pasta e arquivo .module.ts) e o declara no app.module.',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'Nome do novo módulo raiz (kebab-case, ex: "billing"):',
        validate: value => {
          const name = plop.getHelper('kebabCase')(value.trim());
          if (name.length === 0) return 'O nome é obrigatório.';
          if (name.toLowerCase() === 'shared')
            return '"shared" é reservado para uso interno se necessário."'; // Keep this warning
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
            return 'Use kebab-case.';
          if (existsSync(join(process.cwd(), 'src/modules', name)))
            return `Módulo/diretório "${name}" já existe.`;
          return true;
        }
      }
    ],
    actions: function (data) {
      const actions = [];
      const kebabModuleName = plop.getHelper('kebabCase')(data.moduleName);
      const pascalCaseModuleName =
        plop.getHelper('pascalCase')(kebabModuleName);
      const basePath = `src/modules/${kebabModuleName}`;
      const moduleFilePath = `${basePath}/${kebabModuleName}.module.ts`;

      const templateData = {
        pascalCaseName: pascalCaseModuleName
      };

      actions.push({
        type: 'add',
        path: moduleFilePath,
        templateFile: 'plop-templates/module.hbs',
        data: templateData
      });

      const appModulePath = 'src/app.module.ts';
      actions.push({
        type: 'modify',
        path: appModulePath,
        transform: (content, answers) => {
          const proj = new Project({
            useInMemoryFileSystem: false,
            tsConfigFilePath: join(process.cwd(), 'tsconfig.json')
          });
          const absPath = join(process.cwd(), appModulePath);
          const sf =
            proj.addSourceFileAtPathIfExists(absPath) ||
            proj.createSourceFile(absPath, content);
          const currentKebabModuleName = plop.getHelper('kebabCase')(
            answers.moduleName
          );
          const currentPascalModuleName = plop.getHelper('pascalCase')(
            currentKebabModuleName
          );
          const classNameForNewModule = `${currentPascalModuleName}Module`;
          const importPathForNewModule = `./modules/${currentKebabModuleName}/${currentKebabModuleName}.module`;

          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === importPathForNewModule &&
                i
                  .getNamedImports()
                  .some(n => n.getName() === classNameForNewModule)
            )
          ) {
            sf.addImportDeclaration({
              namedImports: [classNameForNewModule],
              moduleSpecifier: importPathForNewModule
            });
          }
          const dec = sf
            .getDescendantsOfKind(SyntaxKind.Decorator)
            .find(d => d.getName() === 'Module');
          if (dec) {
            const modArgs = dec.getArguments()[0];
            if (
              modArgs &&
              modArgs.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const objLit = modArgs;
              let impProp = objLit.getProperty('imports');
              if (!impProp)
                impProp = objLit.addPropertyAssignment({
                  name: 'imports',
                  initializer: '[]'
                });
              const arrLit = impProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              if (
                arrLit &&
                !arrLit
                  .getElements()
                  .some(e => e.getText() === classNameForNewModule)
              )
                arrLit.addElement(classNameForNewModule);
            }
          }
          sf.organizeImports();
          try {
            proj.saveSync();
            runPrettier(appModulePath);
            return readFileSync(absPath, 'utf8');
          } catch (e) {
            console.error(`Erro app.module ${appModulePath}:`, e);
            return sf.getFullText();
          }
        }
      });
      actions.push(async () => {
        runPrettier(moduleFilePath);
        return `Módulo raiz ${kebabModuleName} criado. app.module.ts modificado.`;
      });
      return actions;
    }
  });

  // --- GERADOR DE SERVICE ---
  plop.setGenerator('service', {
    description:
      'Gera um novo service e o declara no módulo principal selecionado.',
    prompts: [
      {
        type: 'list',
        name: 'targetModuleInfo',
        message: 'Para qual MÓDULO PRINCIPAL este service será associado?',
        choices: getModuleChoices
      },
      {
        type: 'input',
        name: 'serviceName',
        message: 'Nome do service (kebab-case):',
        validate: (val, ans) => {
          if (!val || val.trim().length === 0) return 'Nome obrigatório.';
          const sName = plop.getHelper('kebabCase')(val);
          const sPath = join(
            process.cwd(),
            ans.targetModuleInfo.logicBasePath,
            'application/services',
            `${sName}.interface.ts`
          );
          if (existsSync(sPath))
            return `Service ${sName} já existe em ${ans.targetModuleInfo.logicBasePath}.`;
          return true;
        }
      }
    ],
    actions: function (data) {
      const actions = [];
      const { targetModuleInfo, serviceName } = data;
      const sKebab = plop.getHelper('kebabCase')(serviceName);
      const sPascal = plop.getHelper('pascalCase')(serviceName);
      const sInterfaceName = `I${sPascal}Service`;
      const appPath = `${targetModuleInfo.logicBasePath}/application/services`;
      const infraPath = `${targetModuleInfo.logicBasePath}/infrastructure/services`;
      const tData = {
        ...data,
        serviceKebabName: sKebab,
        servicePascalName: sPascal,
        serviceInterfaceName: sInterfaceName,
        serviceClassName: `${sPascal}Service`
      };
      ensureDirectoryExists(appPath);
      ensureDirectoryExists(infraPath);
      const ifPath = `${appPath}/${sKebab}.interface.ts`;
      actions.push({
        type: 'add',
        path: ifPath,
        templateFile: 'plop-templates/service.interface.hbs',
        data: tData
      });
      const srvPath = `${infraPath}/${sKebab}.service.ts`;
      actions.push({
        type: 'add',
        path: srvPath,
        templateFile: 'plop-templates/service.hbs',
        data: tData
      });
      const specPath = `${infraPath}/${sKebab}.service.spec.ts`;
      actions.push({
        type: 'add',
        path: specPath,
        templateFile: 'plop-templates/service.spec.hbs',
        data: tData
      });
      actions.push({
        type: 'modify',
        path: targetModuleInfo.moduleFilePath,
        transform: content => {
          const proj = new Project({
            useInMemoryFileSystem: false,
            tsConfigFilePath: join(process.cwd(), 'tsconfig.json')
          });
          const absPath = join(process.cwd(), targetModuleInfo.moduleFilePath);
          if (!existsSync(absPath))
            throw new Error(
              `Módulo ${targetModuleInfo.moduleFilePath} não encontrado.`
            );
          const sf = proj.addSourceFileAtPath(absPath);

          const ifImport = `./application/services/${sKebab}.interface`;
          const clsImport = `./infrastructure/services/${sKebab}.service`;

          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === ifImport &&
                i.getNamedImports().some(n => n.getName() === sInterfaceName)
            )
          )
            sf.addImportDeclaration({
              namedImports: [sInterfaceName],
              moduleSpecifier: ifImport
            });
          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === clsImport &&
                i
                  .getNamedImports()
                  .some(n => n.getName() === tData.serviceClassName)
            )
          )
            sf.addImportDeclaration({
              namedImports: [tData.serviceClassName],
              moduleSpecifier: clsImport
            });
          const dec = sf
            .getDescendantsOfKind(SyntaxKind.Decorator)
            .find(d => d.getName() === 'Module');
          if (dec) {
            const modArgs = dec.getArguments()[0];
            if (
              modArgs &&
              modArgs.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const objLit = modArgs;
              let provProp = objLit.getProperty('providers');
              if (!provProp)
                provProp = objLit.addPropertyAssignment({
                  name: 'providers',
                  initializer: '[]'
                });
              const provArr = provProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              const provEntry = `{ provide: '${sInterfaceName}', useClass: ${tData.serviceClassName} }`;
              if (
                provArr &&
                !provArr
                  .getElements()
                  .some(e => e.getText().includes(`'${sInterfaceName}'`))
              )
                provArr.addElement(provEntry);
              let expProp = objLit.getProperty('exports');
              if (!expProp)
                expProp = objLit.addPropertyAssignment({
                  name: 'exports',
                  initializer: '[]'
                });
              const expArr = expProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              const expEntry = `'${sInterfaceName}'`;
              if (
                expArr &&
                !expArr.getElements().some(e => e.getText() === expEntry)
              )
                expArr.addElement(expEntry);
            }
          }
          sf.organizeImports();
          try {
            proj.saveSync();
            runPrettier(targetModuleInfo.moduleFilePath);
            return readFileSync(absPath, 'utf8');
          } catch (e) {
            console.error(`Erro ${targetModuleInfo.moduleFilePath}:`, e);
            return sf.getFullText();
          }
        }
      });
      actions.push(async () => {
        runPrettier(ifPath);
        runPrettier(srvPath);
        runPrettier(specPath);
        return 'Service criado e módulo atualizado.';
      });
      return actions;
    }
  });

  // --- GERADOR DE CONTROLLER ---
  plop.setGenerator('controller', {
    description: 'Gera controller e o declara no MÓDULO PRINCIPAL selecionado.',
    prompts: [
      {
        type: 'list',
        name: 'targetModuleInfo',
        message: 'Em qual MÓDULO PRINCIPAL você deseja declarar o controller?',
        choices: getModuleChoices
      },
      {
        type: 'input',
        name: 'controllerName',
        message: 'Nome do controller (kebab-case):',
        validate: (val, ans) => {
          if (!val || val.trim().length === 0) return 'Nome obrigatório.';
          const cName = plop.getHelper('kebabCase')(val);
          const cPath = join(
            process.cwd(),
            ans.targetModuleInfo.logicBasePath,
            'adapters/controllers',
            `${cName}.controller.ts`
          );
          if (existsSync(cPath))
            return `Controller ${cName} já existe em ${ans.targetModuleInfo.logicBasePath}.`;
          return true;
        }
      },
      // REMOVIDO: { type: 'confirm', name: 'useAuth', message: 'Adicionar autenticação user-company?', default: true, },
      {
        type: 'confirm',
        name: 'injectUseCasesPrompt',
        message: 'Injetar use cases?',
        default: false,
        when: ans =>
          listFilesBySuffix(
            join(ans.targetModuleInfo.logicBasePath, 'application/use-cases'),
            '.use-case.ts'
          ).length > 0
      },
      {
        type: 'checkbox',
        name: 'selectedUseCases',
        message: 'Quais use cases injetar?',
        when: ans => ans.injectUseCasesPrompt,
        choices: ans => {
          const ucPath = join(
            ans.targetModuleInfo.logicBasePath,
            'application/use-cases'
          );
          const ucFiles = listFilesBySuffix(ucPath, '.use-case.ts');
          if (ucFiles.length === 0)
            return [
              {
                name: 'Nenhum use case encontrado.',
                value: null,
                disabled: true
              }
            ];
          return ucFiles.map(f => {
            const k = f.replace('.use-case.ts', '');
            const p = plop.getHelper('pascalCase')(k);
            return {
              name: `${p}UseCase`,
              value: { kebabName: k, pascalName: p, className: `${p}UseCase` }
            };
          });
        },
        validate: (ansVal, ansAll) =>
          ansAll.injectUseCasesPrompt && (!ansVal || ansVal.length === 0)
            ? 'Selecione ao menos um use case.'
            : true
      }
    ],
    actions: function (data) {
      const actions = [];
      // REMOVIDO: const { targetModuleInfo, controllerName, useAuth, selectedUseCases } = data;
      const { targetModuleInfo, controllerName, selectedUseCases } = data; // useAuth removido
      const ctrlKebab = plop.getHelper('kebabCase')(controllerName);
      const ctrlPascal = plop.getHelper('pascalCase')(ctrlKebab);
      const ctrlDestPath = `${targetModuleInfo.logicBasePath}/adapters/controllers`;
      const injectedUCs = [];
      if (selectedUseCases && selectedUseCases.length > 0) {
        selectedUseCases.forEach(uc =>
          injectedUCs.push({
            className: uc.className,
            paramName: `${plop.getHelper('camelCase')(uc.pascalName)}UseCase`,
            importPath: `../../application/use-cases/${uc.kebabName}.use-case`
          })
        );
      }
      const tData = {
        ...data,
        moduleName: targetModuleInfo.ownerName,
        controllerKebabName: ctrlKebab,
        controllerPascalName: ctrlPascal,
        // REMOVIDO: useAuth: useAuth,
        // commonNestJsImportsString agora fixo em 'Controller'
        commonNestJsImportsString: 'Controller',
        injectedUseCases: injectedUCs,
        hasInjectedUseCases: injectedUCs.length > 0
      };

      ensureDirectoryExists(ctrlDestPath);
      const ctrlFilePath = `${ctrlDestPath}/${ctrlKebab}.controller.ts`;
      actions.push({
        type: 'add',
        path: ctrlFilePath,
        templateFile: 'plop-templates/controller.hbs',
        data: tData
      });

      actions.push({
        type: 'modify',
        path: targetModuleInfo.moduleFilePath,
        transform: content => {
          const proj = new Project({
            useInMemoryFileSystem: false,
            tsConfigFilePath: join(process.cwd(), 'tsconfig.json')
          });
          const absPath = join(process.cwd(), targetModuleInfo.moduleFilePath);
          if (!existsSync(absPath))
            throw new Error(
              `Módulo ${targetModuleInfo.moduleFilePath} não encontrado.`
            );
          const sf = proj.addSourceFileAtPath(absPath);

          const ctrlImportPath = `./adapters/controllers/${ctrlKebab}.controller`;

          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === ctrlImportPath &&
                i
                  .getNamedImports()
                  .some(n => n.getName() === `${ctrlPascal}Controller`)
            )
          ) {
            sf.addImportDeclaration({
              namedImports: [`${ctrlPascal}Controller`],
              moduleSpecifier: ctrlImportPath
            });
          }
          const dec = sf
            .getDescendantsOfKind(SyntaxKind.Decorator)
            .find(d => d.getName() === 'Module');
          if (dec) {
            const modArgs = dec.getArguments()[0];
            if (
              modArgs &&
              modArgs.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const objLit = modArgs;
              let ctlProp = objLit.getProperty('controllers');
              if (!ctlProp)
                ctlProp = objLit.addPropertyAssignment({
                  name: 'controllers',
                  initializer: '[]'
                });
              const ctlArr = ctlProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              if (
                ctlArr &&
                !ctlArr
                  .getElements()
                  .some(e => e.getText() === `${ctrlPascal}Controller`)
              )
                ctlArr.addElement(`${ctrlPascal}Controller`);
            }
          }
          sf.organizeImports();
          try {
            proj.saveSync();
            runPrettier(targetModuleInfo.moduleFilePath);
            return readFileSync(absPath, 'utf8');
          } catch (e) {
            console.error(`Erro ${targetModuleInfo.moduleFilePath}:`, e);
            return sf.getFullText();
          }
        }
      });
      actions.push(async () => {
        runPrettier(ctrlFilePath);
        return 'Controller criado e módulo atualizado.';
      });
      return actions;
    }
  });

  // --- GERADOR DE USE-CASE ---
  plop.setGenerator('use-case', {
    description: 'Gera use-case e o declara no MÓDULO PRINCIPAL selecionado.',
    prompts: [
      {
        type: 'list',
        name: 'targetModuleInfo',
        message: 'Em qual MÓDULO PRINCIPAL você deseja declarar o use case?',
        choices: getModuleChoices
      },
      {
        type: 'input',
        name: 'useCaseName',
        message: 'Nome do use case (kebab-case, ex: "process-payment"):',
        validate: (val, ans) => {
          if (!val || val.trim().length === 0) return 'Nome obrigatório.';
          const ucName = plop.getHelper('kebabCase')(val);
          const ucPath = join(
            process.cwd(),
            ans.targetModuleInfo.logicBasePath,
            'application/use-cases', // Use-cases já estão dentro de application
            `${ucName}.use-case.ts`
          );
          if (existsSync(ucPath))
            return `Use case ${ucName} já existe em ${ans.targetModuleInfo.logicBasePath}.`;
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'useDependencies',
        message: 'Use case usará dependências (repos/serviços)?',
        default: true
      },
      {
        type: 'checkbox',
        name: 'selectedDependencies',
        message: 'Quais dependências injetar?',
        when: ans => ans.useDependencies,
        choices: ans => {
          const logicBasePath = ans.targetModuleInfo.logicBasePath;
          const allDeps = [];
          const createDepChoiceValue = (
            kebabName,
            pascalName,
            type,
            interfaceName
          ) => {
            let componentPathPartWithoutApp;
            // Caminho para interfaces de repositório (agora dentro de application/domain/entities)
            if (type === 'repository') {
              componentPathPartWithoutApp = `repositories/${kebabName}.repository.interface`;
            } else {
              // Caminho para interfaces de serviço
              componentPathPartWithoutApp = `services/${kebabName}.interface`;
            }

            // Caminho da interface para o arquivo .module.ts (relativo ao root do módulo: src/modules/modulo/)
            const importPathForModuleFile = `./application/${componentPathPartWithoutApp}`;

            // Caminho da interface para o arquivo .use-case.ts (relativo ao use-case: src/modules/modulo/application/use-cases)
            let importPathForUseCaseItself;
            if (type === 'repository') {
              importPathForUseCaseItself = `../repositories/${kebabName}.repository.interface`;
            } else {
              importPathForUseCaseItself = `../services/${kebabName}.interface`;
            }

            return {
              kebabName,
              pascalName,
              type,
              interfaceName,
              importPathForModuleFile: importPathForModuleFile,
              importPathForUseCaseItself: importPathForUseCaseItself
            };
          };

          listFilesBySuffix(
            join(logicBasePath, 'application/repositories'),
            '.repository.interface.ts'
          ).forEach(f => {
            const k = f.replace('.repository.interface.ts', '');
            const p = plop.getHelper('pascalCase')(k);
            const iName = `I${p}Repository`;
            allDeps.push({
              name: `Repo: ${iName}`,
              value: createDepChoiceValue(k, p, 'repository', iName)
            });
          });
          listFilesBySuffix(
            join(logicBasePath, 'application/services'),
            '.interface.ts'
          ).forEach(f => {
            const k = f
              .replace('.interface.ts', '')
              .replace('.service.interface.ts', '');
            const p = plop.getHelper('pascalCase')(k);
            const iName = `I${p}Service`;
            allDeps.push({
              name: `Serviço: ${iName}`,
              value: createDepChoiceValue(k, p, 'service', iName)
            });
          });

          if (allDeps.length === 0)
            return [
              {
                name: 'Nenhuma dependência encontrada.',
                value: null,
                disabled: true
              }
            ];
          return allDeps;
        },
        validate: (ansVal, ansAll) =>
          ansAll.useDependencies && (!ansVal || ansVal.length === 0)
            ? 'Selecione ao menos uma dependência.'
            : true
      }
    ],
    actions: function (data) {
      const actions = [];
      const { targetModuleInfo, useCaseName, selectedDependencies } = data;
      const ucKebab = plop.getHelper('kebabCase')(useCaseName);
      const ucPascal = plop.getHelper('pascalCase')(ucKebab);
      const ucDestPath = `${targetModuleInfo.logicBasePath}/application/use-cases`;
      const depsForTmpl = [];
      if (data.useDependencies && selectedDependencies) {
        selectedDependencies.forEach(depValueObject => {
          depsForTmpl.push({
            importName: depValueObject.interfaceName,
            constructorParamName: `${plop.getHelper('camelCase')(depValueObject.pascalName)}${depValueObject.type === 'repository' ? 'Repository' : 'Service'}`,
            constructorParamType: depValueObject.interfaceName,
            injectionTokenForFactory: `'${depValueObject.interfaceName}'`,
            importPathForUseCaseFile: depValueObject.importPathForUseCaseItself,
            importPathForModuleFile: depValueObject.importPathForModuleFile
          });
        });
      }
      const tData = {
        ...data,
        useCasePascalName: ucPascal,
        useCaseKebabName: ucKebab,
        dependencies: depsForTmpl,
        hasDependencies: depsForTmpl.length > 0,
        factoryParamsStringWithTypes: depsForTmpl
          .map(d => `${d.constructorParamName}: ${d.constructorParamType}`)
          .join(', '),
        factoryConstructorArgsString: depsForTmpl
          .map(d => d.constructorParamName)
          .join(', '),
        injectTokensString: depsForTmpl
          .map(d => d.injectionTokenForFactory)
          .join(', ')
      };
      ensureDirectoryExists(ucDestPath);
      const ucFilePath = `${ucDestPath}/${ucKebab}.use-case.ts`;
      actions.push({
        type: 'add',
        path: ucFilePath,
        templateFile: 'plop-templates/use-case.hbs',
        data: tData
      });
      const specFilePath = `${ucDestPath}/${ucKebab}.use-case.spec.ts`;
      actions.push({
        type: 'add',
        path: specFilePath,
        templateFile: 'plop-templates/use-case.spec.hbs', // Changed to the correct spec template
        data: tData
      });
      actions.push({
        type: 'modify',
        path: targetModuleInfo.moduleFilePath,
        transform: content => {
          const proj = new Project({
            useInMemoryFileSystem: false,
            tsConfigFilePath: join(process.cwd(), 'tsconfig.json')
          });
          const absPath = join(process.cwd(), targetModuleInfo.moduleFilePath);
          if (!existsSync(absPath))
            throw new Error(
              `Módulo ${targetModuleInfo.moduleFilePath} não encontrado.`
            );
          const sf = proj.addSourceFileAtPath(absPath);

          const ucImportPathPrefixForModuleFile = './application/use-cases'; // Relative to root module
          const ucClsName = `${ucPascal}UseCase`;
          const ucImpPath = `${ucImportPathPrefixForModuleFile}/${ucKebab}.use-case`;

          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === ucImpPath &&
                i.getNamedImports().some(n => n.getName() === ucClsName)
            )
          )
            sf.addImportDeclaration({
              namedImports: [ucClsName],
              moduleSpecifier: ucImpPath
            });
          depsForTmpl.forEach(dep => {
            if (
              !sf.getImportDeclaration(
                i =>
                  i.getModuleSpecifierValue() === dep.importPathForModuleFile &&
                  i.getNamedImports().some(n => n.getName() === dep.importName)
              )
            )
              sf.addImportDeclaration({
                namedImports: [dep.importName],
                moduleSpecifier: dep.importPathForModuleFile
              });
          });
          const dec = sf
            .getDescendantsOfKind(SyntaxKind.Decorator)
            .find(d => d.getName() === 'Module');
          if (dec) {
            const modArgs = dec.getArguments()[0];
            if (
              modArgs &&
              modArgs.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const objLit = modArgs;
              let provProp = objLit.getProperty('providers');
              if (!provProp)
                provProp = objLit.addPropertyAssignment({
                  name: 'providers',
                  initializer: '[]'
                });
              const provArr = provProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              if (
                provArr &&
                !provArr
                  .getElements()
                  .some(e => e.getText().includes(ucClsName))
              ) {
                let provEntry = ucClsName;
                if (tData.hasDependencies)
                  provEntry = `{provide:${ucClsName},useFactory:(${tData.factoryParamsStringWithTypes})=>new ${ucClsName}(${tData.factoryConstructorArgsString}),inject:[${tData.injectTokensString}]}`;
                provArr.addElement(provEntry);
              }
              let expProp = objLit.getProperty('exports');
              if (!expProp)
                expProp = objLit.addPropertyAssignment({
                  name: 'exports',
                  initializer: '[]'
                });
              const expArr = expProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              if (
                expArr &&
                !expArr.getElements().some(e => e.getText() === ucClsName)
              )
                expArr.addElement(ucClsName);
            }
          }
          sf.organizeImports();
          try {
            proj.saveSync();
            runPrettier(targetModuleInfo.moduleFilePath);
            return readFileSync(absPath, 'utf8');
          } catch (e) {
            console.error(`Erro ${targetModuleInfo.moduleFilePath}:`, e);
            return sf.getFullText();
          }
        }
      });
      actions.push(async () => {
        runPrettier(ucFilePath);
        runPrettier(specFilePath);
        return 'Use Case criado e módulo atualizado.';
      });
      return actions;
    }
  });

  // --- GERADOR DE ENTIDADE ---
  plop.setGenerator('entidade', {
    description:
      'Gera entidade e repositório e os declara no MÓDULO PRINCIPAL selecionado.',
    prompts: [
      {
        type: 'list',
        name: 'targetModuleInfo',
        message: 'Onde você deseja declarar a entidade/repositório?',
        choices: getModuleChoices
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Nome da entidade (kebab-case, singular):',
        validate: (val, ans) => {
          if (!val || val.trim().length === 0) return 'Nome obrigatório.';
          const eName = plop.getHelper('kebabCase')(val);
          // O caminho de validação agora reflete a nova estrutura
          const ePath = join(
            process.cwd(),
            ans.targetModuleInfo.logicBasePath,
            'application/domain/entities', // Corrigido para a nova estrutura
            `${eName}.entity.interface.ts`
          );
          if (existsSync(ePath))
            return `Entidade ${eName} já existe em ${ans.targetModuleInfo.logicBasePath}/application/domain/entities.`;
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'createRepository',
        message: 'Criar repositório para esta entidade?',
        default: true
      }
    ],
    actions: function (data) {
      const actions = [];
      const { targetModuleInfo, entityName, createRepository } = data;
      const eKebab = plop.getHelper('kebabCase')(entityName);
      const ePascal = plop.getHelper('pascalCase')(eKebab);
      const logicBasePath = targetModuleInfo.logicBasePath;

      // *** CAMINHOS CORRIGIDOS PARA ENTIDADES E REPOSITÓRIOS ***
      const appDomainPath = `${logicBasePath}/application/domain`;
      const domEntPath = `${appDomainPath}/entities`; // Entidade de domínio
      const appRepoPath = `${logicBasePath}/application/repositories`; // Interface de repositório
      const infEntPath = `${logicBasePath}/infrastructure/entities`; // Entidade TypeORM (continua em infrastructure/entities)
      const infRepoPath = `${logicBasePath}/infrastructure/repositories`; // Repositório TypeORM (continua em infrastructure/repositories)

      const tData = {
        ...data,
        entityPascalName: ePascal,
        entityKebabName: eKebab,
        repositoryInterfaceName: `I${ePascal}Repository`,
        repositoryClassName: `${ePascal}TypeOrmRepository`,
        typeOrmEntityClassName: `${ePascal}EntityTypeOrm`
      };

      // Garante que o diretório application/domain e application/domain/entities existam
      ensureDirectoryExists(appDomainPath);
      ensureDirectoryExists(domEntPath);

      ensureDirectoryExists(infEntPath); // Para a entidade TypeORM

      if (createRepository) {
        ensureDirectoryExists(appRepoPath); // Para a interface do repositório
        ensureDirectoryExists(infRepoPath); // Para a implementação do repositório
      }

      const domEntFilePath = `${domEntPath}/${eKebab}.entity.interface.ts`;
      actions.push({
        type: 'add',
        path: domEntFilePath,
        templateFile: 'plop-templates/entity-interface.hbs',
        data: tData
      });
      const infEntFilePath = `${infEntPath}/${eKebab}.typeorm.entity.ts`;
      actions.push({
        type: 'add',
        path: infEntFilePath,
        templateFile: 'plop-templates/entity-typeorm.hbs',
        data: tData
      });
      let appRepoFilePath = '',
        infRepoFilePath = '';
      if (createRepository) {
        appRepoFilePath = `${appRepoPath}/${eKebab}.repository.interface.ts`;
        actions.push({
          type: 'add',
          path: appRepoFilePath,
          templateFile: 'plop-templates/repository-interface.hbs',
          data: tData
        });
        infRepoFilePath = `${infRepoPath}/${eKebab}.typeorm.repository.ts`;
        actions.push({
          type: 'add',
          path: infRepoFilePath,
          templateFile: 'plop-templates/repository-typeorm.hbs',
          data: tData
        });
      }
      actions.push({
        type: 'modify',
        path: targetModuleInfo.moduleFilePath,
        transform: content => {
          const proj = new Project({
            useInMemoryFileSystem: false,
            tsConfigFilePath: join(process.cwd(), 'tsconfig.json')
          });
          const absPath = join(process.cwd(), targetModuleInfo.moduleFilePath);
          if (!existsSync(absPath))
            throw new Error(
              `Módulo ${targetModuleInfo.moduleFilePath} não encontrado.`
            );
          const sf = proj.addSourceFileAtPath(absPath);

          const typeOrmEntImpPath = `./infrastructure/entities/${eKebab}.typeorm.entity`;
          let repoClsImpPath, repoIfImpPath;
          if (createRepository) {
            repoClsImpPath = `./infrastructure/repositories/${eKebab}.typeorm.repository`;
            repoIfImpPath = `./application/repositories/${eKebab}.repository.interface`;
          }

          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === typeOrmEntImpPath &&
                i
                  .getNamedImports()
                  .some(n => n.getName() === tData.typeOrmEntityClassName)
            )
          )
            sf.addImportDeclaration({
              namedImports: [tData.typeOrmEntityClassName],
              moduleSpecifier: typeOrmEntImpPath
            });
          if (
            !sf.getImportDeclaration(
              i =>
                i.getModuleSpecifierValue() === '@nestjs/typeorm' &&
                i.getNamedImports().some(n => n.getName() === 'TypeOrmModule')
            )
          )
            sf.addImportDeclaration({
              namedImports: ['TypeOrmModule'],
              moduleSpecifier: '@nestjs/typeorm'
            });
          if (createRepository) {
            if (
              !sf.getImportDeclaration(
                i =>
                  i.getModuleSpecifierValue() === repoIfImpPath &&
                  i
                    .getNamedImports()
                    .some(n => n.getName() === tData.repositoryInterfaceName)
              )
            )
              sf.addImportDeclaration({
                namedImports: [tData.repositoryInterfaceName],
                moduleSpecifier: repoIfImpPath
              });
            if (
              !sf.getImportDeclaration(
                i =>
                  i.getModuleSpecifierValue() === repoClsImpPath &&
                  i
                    .getNamedImports()
                    .some(n => n.getName() === tData.repositoryClassName)
              )
            )
              sf.addImportDeclaration({
                namedImports: [tData.repositoryClassName],
                moduleSpecifier: repoClsImpPath
              });
          }
          const dec = sf
            .getDescendantsOfKind(SyntaxKind.Decorator)
            .find(d => d.getName() === 'Module');
          if (dec) {
            const modArgs = dec.getArguments()[0];
            if (
              modArgs &&
              modArgs.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const objLit = modArgs;
              let impProp = objLit.getProperty('imports');
              if (!impProp)
                impProp = objLit.addPropertyAssignment({
                  name: 'imports',
                  initializer: '[]'
                });
              const impArr = impProp.getInitializerIfKind(
                SyntaxKind.ArrayLiteralExpression
              );
              if (impArr) {
                let forFeature = impArr
                  .getElements()
                  .find(el =>
                    el.getText().startsWith('TypeOrmModule.forFeature')
                  );
                if (forFeature) {
                  const call = forFeature.asKind(SyntaxKind.CallExpression);
                  if (call) {
                    const argArr = call
                      .getArguments()[0]
                      ?.asKind(SyntaxKind.ArrayLiteralExpression);
                    if (
                      argArr &&
                      !argArr
                        .getElements()
                        .some(e => e.getText() === tData.typeOrmEntityClassName)
                    )
                      argArr.addElement(tData.typeOrmEntityClassName);
                  }
                } else {
                  impArr.addElement(
                    `TypeOrmModule.forFeature([${tData.typeOrmEntityClassName}])`
                  );
                }
              }
              if (createRepository) {
                let provProp = objLit.getProperty('providers');
                if (!provProp)
                  provProp = objLit.addPropertyAssignment({
                    name: 'providers',
                    initializer: '[]'
                  });
                const provArr = provProp.getInitializerIfKind(
                  SyntaxKind.ArrayLiteralExpression
                );
                const provEntry = `{provide:'${tData.repositoryInterfaceName}',useClass:${tData.repositoryClassName}}`;
                if (
                  provArr &&
                  !provArr
                    .getElements()
                    .some(el =>
                      el
                        .getText()
                        .includes(`'${tData.repositoryInterfaceName}'`)
                    )
                )
                  provArr.addElement(provEntry);
                let expProp = objLit.getProperty('exports');
                if (!expProp)
                  expProp = objLit.addPropertyAssignment({
                    name: 'exports',
                    initializer: '[]'
                  });
                const expArr = expProp.getInitializerIfKind(
                  SyntaxKind.ArrayLiteralExpression
                );
                const expEntry = `'${tData.repositoryInterfaceName}'`;
                if (
                  expArr &&
                  !expArr.getElements().some(e => e.getText() === expEntry)
                )
                  expArr.addElement(expEntry);
              }
            }
          }
          sf.organizeImports();
          try {
            proj.saveSync();
            runPrettier(targetModuleInfo.moduleFilePath);
            return readFileSync(absPath, 'utf8');
          } catch (e) {
            console.error(`Erro ${targetModuleInfo.moduleFilePath}:`, e);
            return sf.getFullText();
          }
        }
      });
      actions.push(() => {
        const fmt = [domEntFilePath, infEntFilePath];
        if (createRepository) {
          fmt.push(appRepoFilePath);
          fmt.push(infRepoFilePath);
        }
        for (const f of fmt) runPrettier(f);
        return 'Entidade e Repositório criados e módulo atualizado.';
      });
      return actions;
    }
  });
};
