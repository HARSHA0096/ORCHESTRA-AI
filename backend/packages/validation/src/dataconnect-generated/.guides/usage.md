# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createProject, updateProject, deleteProject, getProject, listProjects, createProviderConfig, updateProviderConfig, deleteProviderConfig, getProviderConfig, listProviderConfigs } from '@dataconnect/generated';


// Operation CreateProject:  For variables, look at type CreateProjectVars in ../index.d.ts
const { data } = await CreateProject(dataConnect, createProjectVars);

// Operation UpdateProject:  For variables, look at type UpdateProjectVars in ../index.d.ts
const { data } = await UpdateProject(dataConnect, updateProjectVars);

// Operation DeleteProject:  For variables, look at type DeleteProjectVars in ../index.d.ts
const { data } = await DeleteProject(dataConnect, deleteProjectVars);

// Operation GetProject:  For variables, look at type GetProjectVars in ../index.d.ts
const { data } = await GetProject(dataConnect, getProjectVars);

// Operation ListProjects: 
const { data } = await ListProjects(dataConnect);

// Operation CreateProviderConfig:  For variables, look at type CreateProviderConfigVars in ../index.d.ts
const { data } = await CreateProviderConfig(dataConnect, createProviderConfigVars);

// Operation UpdateProviderConfig:  For variables, look at type UpdateProviderConfigVars in ../index.d.ts
const { data } = await UpdateProviderConfig(dataConnect, updateProviderConfigVars);

// Operation DeleteProviderConfig:  For variables, look at type DeleteProviderConfigVars in ../index.d.ts
const { data } = await DeleteProviderConfig(dataConnect, deleteProviderConfigVars);

// Operation GetProviderConfig:  For variables, look at type GetProviderConfigVars in ../index.d.ts
const { data } = await GetProviderConfig(dataConnect, getProviderConfigVars);

// Operation ListProviderConfigs: 
const { data } = await ListProviderConfigs(dataConnect);


```