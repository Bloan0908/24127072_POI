# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useAddNewPoi, useGetPoi, useUpdatePoi, useListPoIs } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useAddNewPoi(addNewPoiVars);

const { data, isPending, isSuccess, isError, error } = useGetPoi(getPoiVars);

const { data, isPending, isSuccess, isError, error } = useUpdatePoi(updatePoiVars);

const { data, isPending, isSuccess, isError, error } = useListPoIs();

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
import { addNewPoi, getPoi, updatePoi, listPoIs } from '@dataconnect/generated';


// Operation AddNewPOI:  For variables, look at type AddNewPoiVars in ../index.d.ts
const { data } = await AddNewPoi(dataConnect, addNewPoiVars);

// Operation GetPOI:  For variables, look at type GetPoiVars in ../index.d.ts
const { data } = await GetPoi(dataConnect, getPoiVars);

// Operation UpdatePOI:  For variables, look at type UpdatePoiVars in ../index.d.ts
const { data } = await UpdatePoi(dataConnect, updatePoiVars);

// Operation ListPOIs: 
const { data } = await ListPoIs(dataConnect);


```