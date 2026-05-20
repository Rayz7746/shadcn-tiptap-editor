import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ShadcnEditor } from "@/components/editor"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const SAMPLE_HTML = `<center>
<h1><a href="https://ICEAChess.org"><strong>ICEAChess.org</strong></a></h1>

<h1>2026&nbsp;Spring ICEA Free Chess @ The Wende</h1>

<h1>(Sunday, Feb. 8, 2026)</h1>

<h1><b>Location:</b></h1>

<h2 style="box-sizing: border-box; border-width: 0px; border-style: solid;  margin: 0px; font-size: 18px; color: rgb(255, 0, 0); font-weight: 600; padding: 10px; text-align: center;">Glorya Kaufman Cultural Center</h2>

<h2 class="sp-css-target sp-el-block sp-headline-block-iqueg8x4drv sp-type-header" style="box-sizing: border-box; border-width: 0px; border-style: solid;  margin: 0px; font-size: 18px; color: rgb(255, 0, 0); font-weight: 600; padding: 10px; text-align: center;">10858 Culver Blvd, Culver City, CA 90230</h2>

<h3 style="text-align: center;">Chess for all!</h3>

<h3 style="text-align: center;"><span style="font-weight: bolder;">Free USCF-rated tournament</span>&nbsp;at The Wende is our gift to the community&mdash;come play, learn, and grow at no cost.</h3>
</center>

<p><span class="marker"><em><strong>NOTE: </strong></em></span></p>

<ol>
	<li><span class="marker"><em><strong>After you register, check the <a href="https://caissachess.net/online-registration/preregistration-list/7882">Entry List</a> on this website to confirm that your name is there. No one will be allowed to play if they are not on the Entry List.</strong></em></span></li>
	<li><span class="marker"><em><strong>Chess sets will be provided, but please bring your own chess clock. </strong></em></span></li>
	<li><span class="marker"><em><strong>The tournament is USCF-rated, except for the Rising Stars section. Please ensure your US Chess membership is active. If you are registering for the Rising Stars section, a USCF ID is not required.</strong></em></span></li>
	<li><span class="il" style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small;">Registration could be closed</span><span style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small;">&nbsp;when the&nbsp;</span><span class="il" style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small;">capacity</span><span style="color: rgb(34, 34, 34); font-family: Arial, Helvetica, sans-serif; font-size: small;">&nbsp;is reached.</span></li>
</ol>

<p>&nbsp;</p>

<p><span style="font-weight: bolder;">ICEA Chess @ The Wende</span>, sponsored by The Wende Museum, located at Culver City, quarterly hosts an one-day chess tournament that is&nbsp;<span style="font-weight: bolder;">free and open to everyone</span>. This event invites players of all ages and skill levels to enjoy a competitive and friendly chess experience in a unique and inspiring venue.</p>

<p>Whether you're a seasoned tournament player or new to competitive chess, this is the perfect opportunity to sharpen your skills, connect with the community, and celebrate the timeless game of chess&mdash;all at no cost. Join us for an exciting day of strategy, learning, and fun!</p>

<h1><strong>Sections:</strong></h1>

<p><strong>USCF-rated (USChess membership is required)</strong></p>

<ul>
	<li><strong>OPEN (We will select the top N (N is between 10~16) participants based on the latest rating&nbsp;for the OPEN session, the exact number will be decided before the tournament.&nbsp;)</strong></li>
	<li><strong><strong>1000+&nbsp;</strong></strong></li>
	<li><strong>U1000&nbsp;</strong></li>
</ul>

<p><strong>NOT Rated (USChess membership is NOT required)</strong></p>

<ul>
	<li><strong>Rising Stars</strong></li>
</ul>

<h1><span style="color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; font-size: 15px;">(If a&nbsp;section&nbsp;has fewer&nbsp;than 6 players, it will be combined with the closest appropriate section.)</span></h1>

<h1><strong>Format:</strong></h1>

<h2><strong>4SS, G/30;+5.</strong></h2>

<p>(4&nbsp;total games - Clocks at 30 minutes plus 5 seconds for each move).</p>

<hr />
<h2><strong>Round Times:</strong>&nbsp;</h2>

<p>(<span style="color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; font-size: 15px;">NOTE: One&nbsp;1/2 point bye is allowed, but need to request at least 1 hour before the tournament, otherwise it&nbsp;will be a 0-point bye</span><span style="color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; font-size: 15px;">. The Awards Ceremony will be right after all games finished</span>)</p>

<ul>
	<li>Open Ceremony: 8:45 am (Game Rules)</li>
	<li><strong>Round 1:</strong>&nbsp;9 am</li>
	<li><strong>Round 2:&nbsp;</strong>10:30 am</li>
	<li><strong>Round 3:&nbsp;</strong>12:00 pm&nbsp;</li>
	<li><strong>Round 4:&nbsp;</strong>2:00 pm</li>
	<li>Awards Ceremony (Right after all games finished)</li>
</ul>

<h2><strong>Entry Fee:</strong></h2>

<ul>
	<li>$0 (Free)</li>
</ul>

<h2>&nbsp;</h2>

<h2><strong>Awards</strong></h2>

<ul>
	<li>
	<p>Trophies&nbsp;and Certificates for the Champion of each section</p>
	</li>
	<li>
	<p>Medals&nbsp;and Certificates for the 2nd and 3rd places&nbsp;in each section</p>
	</li>
	<li>
	<p>1st Place in each section will also receive <strong>one free entry</strong> to the upcoming <strong>ICEA Chess @ West LA </strong>Monthly Tournament</p>
	</li>
</ul>

<hr />
<h2>&nbsp;</h2>`

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
})

function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Chess Tournament Announcement",
      content: SAMPLE_HTML,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    alert('Form submitted! Check console for output.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">ShadcnEditor</h1>
          <p className="text-muted-foreground">
            A shadcn-styled rich text editor with WYSIWYG, Markdown, and Source modes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
            <CardDescription>
              Edit content using the visual editor, markdown, or raw HTML source.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title..." {...field} />
                      </FormControl>
                      <FormDescription>The title of your post.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <ShadcnEditor
                          value={field.value}
                          onChange={field.onChange}
                          minHeight="400px"
                        />
                      </FormControl>
                      <FormDescription>
                        Switch between Editor, Markdown, and Source modes using the tabs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg">Submit Form</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
