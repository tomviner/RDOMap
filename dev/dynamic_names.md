Snippet to quickly format pardata:

    <script>
        var ambush = [];
        var result = {};
        ambush.forEach((key, value) => {
            var string1 = "";
            key.Descriptors.forEach((keyD1, valueD1) => {
                if (keyD1.Type != "ID") return;
                string1 = keyD1.Name;
            });

            key.Children.forEach((keyC1, valueC1) => {
                if (keyC1.Name != "MISSION_GIVERS") return;

                keyC1.Children[0].Descriptors.forEach((keyC2, valueC2) => {
                    if (keyC2.Type != "SPAWN_POSITION") return;

                    result[string1] = {
                        x: (0.01552 * keyC2.Coordinate.Y + -63.6).toFixed(4).toString(),
                        y: (0.01552 * keyC2.Coordinate.X + 111.29).toFixed(4).toString()
                    };
                });
            });
        });
        console.log(JSON.stringify(result, null, 4));
    </script>