// import { ToggleButton } from "@kobalte/core";
// import { Show } from "solid-js";
// import "./style.css";
// function feed() {
//   return (
//     <ToggleButton.Root class="toggle-button" aria-label="Mute">
//       {state => (
//         <Show when={state.pressed()} fallback={<VolumeOnIcon />}>
//           <VolumeOffIcon />
//         </Show>
//       )}
//     </ToggleButton.Root>
//   );
// }

// // import {
// //   div
// // } from '@hope-ui/core'
// // // import Parser from 'rss-parser';
// // import {
// //   Show
// // } from "solid-js";
// import {Switch} from '@kobalte/core'

// const Feed = (props) => {
//   // const [feedData, setFeedData] = createSignal({});
//   // const [showError, setShowError] = createSignal(false);
//   // const [currentError, setCurrentError] = createSignal('no error yet');
//   // const { style } = createTransition(showError, {
//   //   transition: "fade",
//   //   duration: 2000,
//   //   easing: "ease"
//   // });

//   // createEffect(() => {
//   //   fetch(`https://localhost:5000/${props.id}`)
//   //   .then(feed => {
//   //     feed.text().then(feedText => {
//   //       const feedTextStr = feedText.toString()
//   //       const newFeedData = `{${props.id}: ${feedTextStr}}`
//   //       newFeedData[`${props.id}`] = feedTextStr
//   //       setFeedData(newFeedData)
//   //     })
//   //   })
//   //   .catch(error => {
//   //       setCurrentError(`${error.message} ${props.id}` )
//   //       setShowError(true)
//   //     }
//   //   )
//     // const parser = new Parser();
//     // parser.parseURL(props.id)
//     // .then(feed => {
//     //   console.log(feed)
//     //   setFeedData(feed.items);
//     // })
//   // });
//   return (
//     <div>{props.id}</div>
//       <div>
//       <Switch.Root onClick={() => handleToggleChecked(feed.id)} />
//     </div>
//     //<div>
//   //     <Show when={feedData()[props.id] == null}>{props.id}</Show>
//   //     <Show when={feedData()[props.id] != null}>{JSON.stringify(feedData, null, 2)}</Show>
//   //     <div onClick={() => setShowError(() => false)} p={4} color="white" mt="4" bg="Red" rounded="md" shadow="md" >
//   //       {currentError()}
//   //     </div>
//   //   </div>
//   );
// };

// export default Feed;

// {/* <ul>
// {feedData() &&
//   feedData().map((item) => (
//     <li>
//       <a href={item.link}>{item.title}</a>
//       <p>{item.contentSnippet}</p>
//     </li>
//   ))}
// </ul> */}



// // import {
// //   FunctionComponent,
// //   createContext,
// //   useContext,
// //   ReactNode,
// // } from 'react';
// // import useSWR from 'swr';
// // import { Grid } from '@mui/material';
// // import {
// //   pickCheckedFeedsForCategory,
// //   parseFeedContentMulti
// // } from '../utils';
// // import axios from 'axios';
// // import { useStorage } from '../react-hooks/useStorage';
// // import defaultCorsProxies from '../react-hooks/defaultCorsProxies.json';
// // import defaultFeeds from '../react-hooks/defaultFeeds.json';
// // import { CategoryContext } from './CheckedCategory';

// // export const ParsedFeedContentContext = createContext({});

// // type Props = { children: ReactNode };
// // const Feed: FunctionComponent<Props> = ({ children }: Props) => {
// //   const categoryContext = useContext(CategoryContext);
// //   const category = `${categoryContext}`;

// //   const { fetchFileLocal } = useStorage();
// //   const { data: feedsdata } = useSWR('feeds', fetchFileLocal('feeds', {}), {
// //     fallbackData: defaultFeeds,
// //   });
// //   const feeds = { ...(feedsdata as object) };

// //   const { data: corsProxiesdata } = useSWR(
// //     'corsProxies',
// //     fetchFileLocal('corsProxies', defaultCorsProxies),
// //     { fallbackData: defaultCorsProxies }
// //   );
// //   const corsProxies = { ...(corsProxiesdata as object) };

// //   const checkedCorsProxies = Object.entries({ ...corsProxies })
// //     .filter(
// //       (corsProxyEntry) =>
// //         Object.assign(corsProxyEntry[1] as object).checked === true
// //     )
// //     .map((corsProxyEntry: [string, unknown]) => corsProxyEntry[0])
// //     .filter((noblanks) => !!noblanks);

// //   const fetchFeedContent = (
// //     feedUrl: string,
// //     corsProxies: string[]
// //   ): Promise<object> => {
// //     return new Promise((resolve, reject) => {
// //       const [corsProxy, ...rest] = corsProxies;
// //       [corsProxy]
// //         .flat()
// //         .filter((corsProxyItem) => {
// //           return !!corsProxyItem;
// //         })
// //         .forEach((corsProxyItem) => {
// //           axios
// //             .get(`${corsProxyItem}${feedUrl}`)
// //             .then((response) => {
// //               resolve(response);
// //             })
// //             .catch(() => {
// //               if (rest.length === 0) {
// //                 reject();
// //               }
// //               fetchFeedContent(feedUrl, rest);
// //             });
// //         });
// //     });
// //   };
// //   const fetchFeedContentMulti = (
// //     feeds: object[],
// //     corsProxies: string[]
// //   ): Promise<object> => {
// //     return new Promise((resolve, reject) => {
// //       const feedQueue: object[] = [];
// //       feeds.forEach((feed) => {
// //         // console.log(feed[1]['label']) <- todo typescript compatible version of this
// //         const feedLabel =
// //           Object.entries(Object.values(feed)[1])
// //             .filter((feedEntryAttribute) => {
// //               return feedEntryAttribute[0] === 'label';
// //             })
// //             .map((feedEntryAttribute) => {
// //               return `${feedEntryAttribute[1]}`;
// //             })
// //             .find(() => true) || '';

// //         feedQueue.push(
// //           new Promise((resolve, reject) => {
// //             const feedKey = feed.toString().split(',')[0];
// //             fetchFeedContent(feedKey, corsProxies)
// //               .then((fetchedContent: object) => {
// //                 return [fetchedContent].flat().forEach((fetchedContentItem) => {
// //                   resolve([
// //                     feedKey,
// //                     { feedLabel: `${feedLabel}`, ...fetchedContent },
// //                   ]);
// //                 });
// //               })
// //               .catch((error) => {
// //                 resolve({});
// //               });
// //           })
// //         );
// //       });
// //       Promise.all(feedQueue)
// //         .then((fetchedContent) => {
// //           resolve(Object.fromEntries(Object.assign(fetchedContent as object)));
// //         })
// //         .catch(() => resolve({}));
// //     });
// //   };

// //   const fetcher = () => {
// //     return new Promise((resolve, reject) => {
// //       fetchFeedContentMulti(pickCheckedFeedsForCategory(feeds, category), checkedCorsProxies)
// //         .then((fetchedContent) => {
// //           return parseFeedContentMulti(fetchedContent)
// //         })
// //         .then((parsedContent) => {
// //           resolve(parsedContent)
// //         })
// //         .catch((error) => reject(error));
// //     });
// //   };

// //   const { data: parsedContentdata } = useSWR(
// //     `fetchedContent-${category}`,
// //     fetcher,
// //     {
// //       suspense: true,
// //       revalidateOnFocus: true,
// //       focusThrottleInterval: 60000
// //     }
// //   );

// //   const parsedContent: unknown = { ...(parsedContentdata as object) };

// //   return (
// //     <Grid>
// //       {Object.entries(parsedContent as object)
// //         .filter((parsedFeedContent) => {
// //           return !!parsedFeedContent[1];
// //         })
// //         .map((parsedFeedContent: [string, object]) => {
// //           const parsedFeedContentObj = Object.fromEntries([parsedFeedContent]);
// //           return (
// //             <ParsedFeedContentContext.Provider
// //               key={JSON.stringify(parsedFeedContentObj)}
// //               value={parsedFeedContentObj}
// //             >
// //               {children}
// //             </ParsedFeedContentContext.Provider>
// //           );
// //         })}
// //     </Grid>
// //   );
// // };

// // export default Feed;
