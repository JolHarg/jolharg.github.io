const elementFactory = {
    htmlCache: [],
    defineElements(definitions, prefix = 'jh')
    {
        for (const name in definitions) {
            const newName = `${prefix}-${name}`,
                location = newName.replace(/-/g, '/'),
                base = `js/components`,
                defaultFilename = `index`,
                filename = `${base}/${location}/${defaultFilename}`,
                htmlFile = `${filename}.html`,
                cssFile = `${filename}.css`,
                subDefinitions = definitions[name],
                options = subDefinitions.options || {};

            delete subDefinitions.options;

            customElements.define(newName, this._factory(htmlFile, cssFile, options));
            this.defineElements(subDefinitions, newName);
        }
    },

    _factory(htmlFile, cssFile, options)
    {
        return class extends HTMLElement
        {
            async connectedCallback()
            {
                let html;

                if (elementFactory.htmlCache[htmlFile]) {
                    html = elementFactory.htmlCache[htmlFile];
                } else {
                    html = await (await fetch(htmlFile)).text();
                    elementFactory.htmlCache[htmlFile] = html;
                }
                const shadowRoot = this.attachShadow({mode: 'open'});

                shadowRoot.innerHTML = html;

                const customHref = this.getAttribute("href"),
                    link = shadowRoot.querySelector("a");
                if (link) {
                    link.setAttribute("href", customHref);
                }

                const customSrc = this.getAttribute("src"),
                    img = shadowRoot.querySelector("img");
                if (img) {
                    img.setAttribute("src", customSrc);
                }

                if (options.bsCSS) {
                    const bsLink = document.createElement("link");
                    bsLink.rel = "stylesheet";
                    bsLink.href = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css";
                    bsLink.integrity = "sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb";
                    bsLink.setAttribute("crossorigin", "anonymous");

                    shadowRoot.appendChild(bsLink);
                }

                if (options.css) {
                    const style = document.createElement('link');
                    style.href = cssFile;
                    style.type = "text/css";
                    style.rel = "stylesheet";
                    shadowRoot.appendChild(style);
                }
            }
        };
    }
};
export default elementFactory;
