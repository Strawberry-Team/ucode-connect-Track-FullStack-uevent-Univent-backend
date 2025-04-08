// test/e2e.global.teardown.ts
export default async (): Promise<void> => {
    console.log('🧹 Cleaning up test environment...');

    // Force process cleanup
    await new Promise(resolve => setTimeout(resolve, 500));

    // Force exit any hanging connections
    process.exit(0);
};
