import { Client } from '@notionhq/client';
import { PersonUserObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export async function runNotion(): Promise<void> {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  // createPage(notion);
  search(notion);
}

async function search(notion: Client): Promise<void> {
  const response = await notion.search({
    query: '',
    filter: {
      value: 'database',
      property: 'object',
    },
    sort: {
      direction: 'ascending',
      timestamp: 'last_edited_time',
    },
  });
  console.log(response);
}

async function createDatabase(notion: Client): Promise<void> {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: '98ad959b-2b6a-4774-80ee-00246fb0ea9b',
    },
    icon: {
      type: 'emoji',
      emoji: '📝',
    },
    cover: {
      type: 'external',
      external: {
        url: 'https://website.domain/images/image.png',
      },
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'Grocery List',
          link: null,
        },
      },
    ],
    properties: {
      Name: {
        title: {},
      },
      Description: {
        rich_text: {},
      },
      'In stock': {
        checkbox: {},
      },
      'Food group': {
        select: {
          options: [
            {
              name: '🥦Vegetable',
              color: 'green',
            },
            {
              name: '🍎Fruit',
              color: 'red',
            },
            {
              name: '💪Protein',
              color: 'yellow',
            },
          ],
        },
      },
      Price: {
        number: {
          format: 'dollar',
        },
      },
      'Last ordered': {
        date: {},
      },
      'Number of meals': {
        rollup: {
          rollup_property_name: 'Name',
          relation_property_name: 'Meals',
          function: 'count',
        },
      },
      'Store availability': {
        type: 'multi_select',
        multi_select: {
          options: [
            {
              name: 'Duc Loi Market',
              color: 'blue',
            },
            {
              name: 'Rainbow Grocery',
              color: 'gray',
            },
            {
              name: 'Nijiya Market',
              color: 'purple',
            },
          ],
        },
      },
      '+1': {
        people: {},
      },
      Photo: {
        files: {},
      },
    },
  });
  console.log(response);
}

async function getUser(notion: Client): Promise<void> {
  const listUsersResponse = await notion.users.list({});
  const user = listUsersResponse.results[0] as PersonUserObjectResponse;
  console.log(user);
}

async function createPage(notion: Client): Promise<void> {
  const response = await notion.pages.create({
    cover: {
      type: 'external',
      external: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg',
      },
    },
    icon: {
      type: 'emoji',
      emoji: '🥬',
    },
    parent: {
      type: 'page_id',
      page_id: 'caba3036fee34300885cb88ce3495206',
    },
    properties: {
      title: [
        {
          text: {
            content: 'Tuscan kale',
          },
        },
      ],
    },
    children: [
      {
        object: 'block',
        heading_2: {
          rich_text: [
            {
              text: {
                content: 'Lacinato kale',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        paragraph: {
          rich_text: [
            {
              text: {
                content:
                  'Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.',
                link: {
                  url: 'https://en.wikipedia.org/wiki/Lacinato_kale',
                },
              },
            },
          ],
          color: 'default',
        },
      },
    ],
  });
  console.log(response);
}
