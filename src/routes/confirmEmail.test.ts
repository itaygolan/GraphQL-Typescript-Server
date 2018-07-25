import fetch from 'node-fetch';

test("Bad id sends invalid back", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/123123`);
    const text = await response.text();
    expect(text).toEqual("invalid");
})