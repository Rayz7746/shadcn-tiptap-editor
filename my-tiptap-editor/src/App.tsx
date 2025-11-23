import { useMemo, useState } from 'react'
import { RichTextEditor } from './components/RichTextEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  const initialCopy = `
<style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}-->
</style>
<center>
<h1 dir="ltr">ICEA 2025&nbsp;October OTB&nbsp;Chess Tournament&nbsp;[Oct. 11th]</h1>

<h2><em>Playing Competitive USCF-rated OTB Chess Tournaments in West LA</em></h2>

<h2><em>All Children and Adults are welcome!</em></h2>

<h2 style="box-sizing: border-box; border-width: 0px; border-style: solid;  margin: 0px; font-size: 18px; color: rgb(255, 0, 0); font-weight: 600; padding: 10px; text-align: center;">2100-rated players or seniors (65+) play free</h2>

<div class="row">&nbsp;</div>
</center>

<h2 dir="ltr"><b id="docs-internal-guid-7b1d8ac2-7fff-db2c-2f5a-cac7d14bcea7">Tournament Date: Saturday, Oct. 11th, 2025</b></h2>

<p dir="ltr"><b>Location: 11555 National Blvd, Los Angeles, CA 90064</b></p>

<p dir="ltr"><strong>Sections / Format / Time Control:</strong></p>

<ul>
  <li><strong>2000+ Section:&nbsp;</strong><strong>4 Round SS,&nbsp; G/45;+5</strong></li>
  <li><strong>1600+ Section:&nbsp;4 Round SS,&nbsp; G/45;+5</strong></li>
  <li><strong>1000+ Section:&nbsp;</strong><strong>4 Round SS,&nbsp; G/45;+5&nbsp;</strong></li>
  <li><strong>U1000 Section: 3 Double Rounds SS, G/30;+5&nbsp;</strong>(each player plays&nbsp;x2 games Black/White Vs. same opponent)</li>
</ul>

<p><strong>Round Time:</strong></p>

<ul dir="ltr">
  <li>2000+/ 1600+ / 1000+: 9am / 11am / 2pm / 4pm</li>
  <li>U1000: 9am / 11am / 2pm</li>
</ul>

<hr />
<h2>Play-up Policy:</h2>

<div style="padding: 20px 20px 20px 50px; background-color: #E8F4ED; border: 1px solid #45A169; border-radius: 5px;">We understand that players are eager to play up, and we do our best to accommodate such requests whenever possible. However, to maintain fairness and consistency, we have established a clear and transparent Play-up Policy. This helps ensure a more competitive and structured environment for players in the upper sections. If your decision to register is solely dependent on section placement, we strongly encourage you to review the Play-up Policy carefully before completing your registration. Please also note that section adjustments are typically made closer to the tournament date. This allows us to account for players who may gain rating points before the event and become eligible to play in higher sections. While players are allowed to select their preferred section at registration, we reserve the right to make final adjustments in accordance with the Play-up Policy.</div>

<ol>
  <li>Play-up option is available to players within 100 USCF rating points of the section they want to play in.</li>
  <li>If you&rsquo;re an unrated player who hasn&rsquo;t played any rated games yet, you&rsquo;ll need to start with the U1000 section. Keep in mind that your rating will be provisional within your first 25 rated games,&nbsp;provisioned rating could be used for section eligibility as well.</li>
  <li>The peak rating within the past six months may also be considered.</li>
</ol>

<h2>More Tournament Rules: <a href="https://Rules.ICEAChess.org">Rules.ICEAChess.org</a> (Please read before your register)</h2>

<hr />
<h3>Entry Fee: $25 (Early Bird by Sept. 30th) / $35&nbsp;(After Sept. 30th)</h3>

<h5>(2100+ Rated Players or Age 65+&nbsp;play for free: fill&nbsp;<a href="https://request.ICEAChess.org">this form</a>&nbsp;to claim the free entry)</h5>

<p dir="ltr"><em>Note:</em></p>

<ol>
  <li><em>Please request&nbsp;byes in advance <a href="https://request.iceachess.org">here</a> if you need to miss any rounds.&nbsp;</em><strong>One half-point bye available for 2000+ / 1600+ /&nbsp;1000+ sections (0-point bye for the last round)</strong>.</li>
  <li>For any correction after the registration, please submit a change request <a href="https://request.iceachess.org">here</a>:&nbsp;https://request.iceachess.org</li>
  <li><em>Players should bring their own sets &amp; clocks &amp; pencils &amp; scoresheets.</em></li>
  <li><em>Notation is not required for players in the U1000 section and&nbsp;in 3rd grade and below.</em></li>
  <li><em>We will use Oct. 2025&nbsp;supplement (or most recent) ratings for the pairing.</em></li>
  <li><em>TDs reserve&nbsp;the right to adjust ratings and the sections in unusual circumstances.</em></li>
  <li><em>Registration is non-refundable, but we can roll your registration over to next month&rsquo;s tournament or a future event.</em></li>
</ol>

<p><strong>Cash Prizes / Medals</strong><br />
<em>(Payouts will be based on the number of entries per section):</em></p>

<ul>
  <li><strong>6&ndash;10 players</strong>: Top 3 players</li>
  <li><strong>11&ndash;20 players</strong>: Top 4 players</li>
  <li><strong>21&ndash;30 players</strong>: Top 5 players</li>
  <li><strong>31&ndash;40 players</strong>: Top 6 players</li>
  <li><strong>41&ndash;50 players</strong>: Top 7&nbsp;players</li>
</ul>

<p>Note:</p>

<ol>
  <li>In the U1000 section, we offer a medal as an alternative prize option for children who prefer receiving a medal instead of a cash award.</li>
  <li>If a&nbsp;section&nbsp;has fewer&nbsp;than 6 players, it will be combined with the closest appropriate section.</li>
  <li>If a section has more than 50 players, it will be divided into two subgroups: players with an odd-numbered position in the registration order will be placed in Group A, and those with an even-numbered position will be placed in Group B.</li>
</ol>

<p>Check <a href="https://iceachess.org/tournaments">here</a> for more details or any updates&nbsp;about ICEA Chess USCF-rated OTB Chess Tournaments.</p>
  `.trim()
  const [content, setContent] = useState(initialCopy)
  const stats = useMemo(() => ({ characters: content.length, lines: content.split('\n').length }), [content])

  return (
    <div className="min-h-screen bg-slate-100/90 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-2xl border border-white/40 bg-white/70 p-6 text-center shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Shadcn Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">CKEditor-inspired Rich Text</h1>
          <p className="text-sm text-slate-600">
            Switch between WYSIWYG, Source, and Markdown modes while keeping a classic toolbar experience tailored to tournament announcements.
          </p>
        </header>

        <RichTextEditor value={content} onChange={setContent} />

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border border-white/50 bg-white/90 shadow-sm backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Live HTML Preview</CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-slate-500">Validate rendered formatting</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-auto rounded-md border border-slate-200 bg-white/80 p-4">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </CardContent>
          </Card>

          <Card className="border border-slate-800 bg-slate-950/95 text-slate-50 shadow-inner">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Raw HTML Output</CardTitle>
              <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                {stats.characters} chars · {stats.lines} lines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/30 p-4 font-mono text-sm leading-relaxed">
                {content}
              </pre>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default App
