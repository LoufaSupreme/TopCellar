const entryValueKPI = async () => {
    console.log('Calculating data based on estimated entry values...');

    try {
        const res = await fetch(`kpi/entry_value/`);
        const kpiObject = await res.json();
        return kpiObject;
    }
    catch (err) {
        console.error(err);
    }

}
