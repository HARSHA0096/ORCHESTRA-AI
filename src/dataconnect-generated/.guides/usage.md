# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateProject, useUpdateProject, useDeleteProject, useGetProject, useListProjects, useCreateProviderConfig, useUpdateProviderConfig, useDeleteProviderConfig, useGetProviderConfig, useListProviderConfigs } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateProject(createProjectVars);

const { data, isPending, isSuccess, isError, error } = useUpdateProject(updateProjectVars);

const { data, isPending, isSuccess, isError, error } = useDeleteProject(deleteProjectVars);

const { data, isPending, isSuccess, isError, error } = useGetProject(getProjectVars);

const { data, isPending, isSuccess, isError, error } = useListProjects();

const { data, isPending, isSuccess, isError, error } = useCreateProviderConfig(createProviderConfigVars);

const { data, isPending, isSuccess, isError, error } = useUpdateProviderConfig(updateProviderConfigVars);

const { data, isPending, isSuccess, isError, error } = useDeleteProviderConfig(deleteProviderConfigVars);

const { data, isPending, isSuccess, isError, error } = useGetProviderConfig(getProviderConfigVars);

const { data, isPending, isSuccess, isError, error } = useListProviderConfigs();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



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