import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addMyInfo, addToAllPost, addUser, deleteThePost } from "./slice";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/users",
    credentials: true,
  }),
  keepUnusedDataFor: 60 * 60 * 24 * 7,
  tagTypes: ["Post", "User", "Me"],

  endpoints: (builder) => ({
    //user
    signin: builder.mutation({
      query: (data) => ({
        url: "signin",
        method: "POST",
        body: data,
      }),
      invalidateTags: ["Me"],
    }),
    login: builder.mutation({
      query: (data) => ({
        method: "POST",
        url: "login",
        body: data,
      }),
      invalidateTags: ["Me"],
    }),
    myInfo: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      invalidateTags: ["Me"],
      async onQueryStarted(params, { dispatch, queryFullfilled }) {
        try {
          const { data } = await queryFullfilled;
          dispatch(addMyInfo(data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    logoutMe: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      invalidateTags: ["Me"],
    }),
    userDetails: builder.query({
      query: (id) => ({
        url: `user/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addUser(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    searchUsers: builder.query({
      query: (query) => ({
        url: `users/search/${query}`,
        method: "GET",
      }),
    }),
    followUser: builder.mutation({
      query: (id) => ({
        url: `user/follow/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Me"],
    }),
    // post
    addPost: builder.mutation({
      query: (data) => ({
        url: `post`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Post"],
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addSingle(data));
        } catch (err) {
          console.log(err);
        }
      },
    }),
    allPost: builder.query({
      query: (page) => ({
        url: `post?page=${page}`,
        method: "GET",
      }),
      provideTags: (result, error, args) => {
        return result
          ? [
              ...result.posts.map(({ _id }) => ({ type: "Post", id: _id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }];
      },
      async onQueryStarted(params, { dispatch, queryFullfilled }) {
        try {
          const { data } = await queryFullfilled;
          dispatch(addToAllPost(data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `post/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(deleteThePost(data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    likePost: builder.mutation({
      query: (id) => ({
        url: `post/like/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }],
    }),
    singlePost: builder.query({
      url: `post/${id}`,
      method: "GET",
      providesTags: (result, error, { id }) => [{ type: "Post", id }],
    }),
    repost: builder.mutation({
      query: (id) => ({
        url: `repost/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    //comment
    addComment: builder.mutation({
      query: ({ id, ...data }) => ({
        method: "POST",
        url: `comment/${id}`,
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteComment: builder.mutation({
      query: ({ id, postId }) => ({
        method: "DELETE",
        url: `comment/${postId}/${id}`,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),
    lazySearchUsers: builder.query({
      query: (data) => ({
        method: "GET",
        url: `/search/${id}`,
        body: data,
      }),
    }),
  }),
});

export const {
  useSigninMutation,
  useLoginMutation,
  useMyInfoQuery,
  useLogoutMeMutation,
  useUserDetailsQuery,
  useSearchUsersQuery,
  useFollowUserMutation,
  useUpdateProfileMutation,
  useAllPostQuery,
  useAddPostMutation,
  useSinglePostQuery,
  useDeletePostMutation,
  useLikePostMutation,
  useRepostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLazySearchUsersQuery,
} = serviceApi;
