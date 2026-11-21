// mport { useMutation } from '@tanstack/vue-query'
// import { createFile, deleteFile, permanentlyFile, restoreFile } from './filesApi'
// import { toast } from 'vue-sonner'
// import { ref } from 'vue'

// const useCreateFile = () => {
//   const uploadProgress = ref(0)

//   const { mutate, isPending, isSuccess, isError } = useMutation({
//     mutationFn: (data) => {
//       return new Promise((resolve, reject) => {
//         createFile(data, (progress) => {
//           uploadProgress.value = progress
//         })
//           .then(resolve)
//           .catch(reject)
//       })
//     },
//     onSuccess: () => {
//       toast.success('Faýl üstünlikli ýüklenildi')

//       setTimeout(() => {
//         uploadProgress.value = 0
//       }, 3000)
//     },
//     onError: (err) => {
//       toast.error(err?.response?.data?.message || 'Serwerde näsazlyk bar')
//     },
//   })

//   return { mutate, isPending, isSuccess, isError, uploadProgress }
// }

// const useDeleteFile = () => {
//   const { mutate, isPending, isSuccess, isError } = useMutation({
//     mutationFn: (id) => deleteFile(id),
//     onSuccess: () => {
//       toast.success('Faýl maglumatlary üstünlikli pozuldy')
//     },
//     onError: (err) => {
//       toast.error(err?.response?.data?.message || 'Serwerde näsazlyk bar')
//     },
//   })
//   return { mutate, isPending, isSuccess, isError }
// }
// const usePermanentlyFile = () => {
//   const { mutate, isPending, isSuccess, isError } = useMutation({
//     mutationFn: (id) => permanentlyFile(id),
//     onSuccess: () => {
//       toast.success('Faýl üstünlikli pozuldy')
//     },
//     onError: (err) => {
//       toast.error(err?.response?.data?.message || 'Serwerde näsazlyk bar')
//     },
//   })
//   return { mutate, isPending, isSuccess, isError }
// }

// const useRestoreFile = () => {
//   const { mutate, isPending, isSuccess, isError } = useMutation({
//     mutationFn: (id) => restoreFile(id),
//     onSuccess: () => {
//       toast.success('Faýl üstünlikli dikeldildi')
//     },
//     onError: (err) => {
//       toast.error(err?.response?.data?.message || 'Serwerde näsazlyk bar')
//     },
//   })
//   return { mutate, isPending, isSuccess, isError }
// }
// export { useCreateFile, useDeleteFile, usePermanentlyFile, useRestoreFile }
