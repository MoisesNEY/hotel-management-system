<#macro registrationLayout displayMessage=true displayInfo=false displayRequiredFields=false>
<!DOCTYPE html>
<html<#if realm.internationalizationEnabled> lang="${locale}"</#if>>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body>
    <div class="login-pf-page">
        <div id="kc-header">
            <div id="kc-header-wrapper">Gran Hotel</div>
        </div>

        <div id="kc-content">
            <div id="kc-content-wrapper">
                
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert alert-${message.type}">
                        <#if message.type == 'success'><span class="pficon pficon-ok"></span></#if>
                        <#if message.type == 'warning'><span class="pficon pficon-warning-triangle-o"></span></#if>
                        <#if message.type == 'error'><span class="pficon pficon-error-circle-o"></span></#if>
                        <#if message.type == 'info'><span class="pficon pficon-info"></span></#if>
                        <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <h1 id="kc-page-title"><#nested "header"></h1>

                <#nested "form">

                <#if displayInfo>
                    <#nested "info">
                </#if>

            </div>
        </div>
    </div>
</body>
</html>
</#macro>
